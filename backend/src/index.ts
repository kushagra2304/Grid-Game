import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors({
  origin: "https://grid-game-gules.vercel.app",
  methods: ["GET", "POST"],
  credentials: true
}));
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

let grid: string[][] = Array(10)
  .fill(null)
  .map(() => Array(10).fill(""));

let onlineCount = 0;

io.on("connection", (socket) => {
  onlineCount++;
  io.emit("online-count", onlineCount);
  socket.emit("grid-update", grid);

  console.log("A player connected:", socket.id);

  socket.on("update-cell", ({ row, col, char }) => {
    if (!grid[row][col]) {
      grid[row][col] = char;
      io.emit("grid-update", grid);
    }
  });

  socket.on("disconnect", () => {
    onlineCount--;
    io.emit("online-count", onlineCount);
    console.log("A player disconnected:", socket.id);
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));
