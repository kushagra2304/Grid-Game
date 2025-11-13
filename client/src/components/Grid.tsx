import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Users, Grid as GridIcon, Zap, Clock } from "lucide-react";

const socket = io("https://grid-game-zrhg.onrender.com");

interface Move {
  row: number;
  col: number;
  char: string;
  playerId: string;
  timestamp: number;
}

export default function Grid() {
  const [grid, setGrid] = useState<string[][]>([]);
  const [online, setOnline] = useState<number>(0);
  const [disabled, setDisabled] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [history, setHistory] = useState<Move[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    socket.on("grid-update", (data) => setGrid(data));
    socket.on("online-count", (count) => setOnline(count));
    socket.on("history-update", (data) => setHistory(data));
    socket.emit("get-history");

    return () => {
      socket.off("grid-update");
      socket.off("online-count");
      socket.off("history-update");
    };
  }, []);

  const handleClick = (r: number, c: number) => {
    if (disabled) return;
    const char = prompt("Enter a Unicode character (e.g. a-z, A-Z, 0-9):") || "";
    if (!char) return;
    socket.emit("update-cell", { row: r, col: c, char });
    setDisabled(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-8">
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <GridIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Collaborative Grid</h1>
                <p className="text-sm text-gray-500">Create art together in real-time</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <Users className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">{online} online</span>
            </div>
          </div>

          {disabled && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <Zap className="w-5 h-5 text-amber-600" />
              <p className="text-sm font-medium text-amber-700">
                You've made your move! Watch others create.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div
            className="grid gap-2 mx-auto"
            style={{
              gridTemplateColumns: "repeat(10, 48px)",
              width: "fit-content",
            }}
          >
            {grid.map((row, rIdx) =>
              row.map((cell, cIdx) => {
                const cellId = `${rIdx}-${cIdx}`;
                const isHovered = hoveredCell === cellId;

                return (
                  <button
                    key={cellId}
                    onClick={() => handleClick(rIdx, cIdx)}
                    onMouseEnter={() => setHoveredCell(cellId)}
                    onMouseLeave={() => setHoveredCell(null)}
                    disabled={disabled}
                    className={`
                      w-12 h-12 rounded-lg text-2xl flex items-center justify-center
                      transition-all duration-200 font-medium
                      ${
                        disabled
                          ? "bg-gray-50 border-2 border-gray-200 cursor-not-allowed"
                          : "bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 hover:border-indigo-400 hover:shadow-lg hover:scale-105 cursor-pointer"
                      }
                      ${isHovered && !disabled ? "ring-2 ring-indigo-300" : ""}
                      ${cell ? "bg-gradient-to-br from-indigo-50 to-purple-50" : ""}
                    `}
                  >
                    {cell}
                  </button>
                );
              })
            )}
          </div>

          {!disabled && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Click any cell to add your unique character
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-800 transition"
          >
            <Clock className="w-4 h-4" />
            {showHistory ? "Hide" : "Show"} History ({history.length})
          </button>

          {showHistory && (
            <div className="mt-3 max-h-60 overflow-y-auto border-t pt-3 text-sm text-gray-600">
              {history.length === 0 ? (
                <p className="text-gray-400 text-center">No moves yet.</p>
              ) : (
                history
                  .slice()
                  .reverse()
                  .map((move, index) => (
                    <div
                      key={index}
                      className="flex justify-between py-1 border-b border-gray-100 last:border-none"
                    >
                      <span>
                        <span className="font-semibold text-indigo-600">{move.char}</span> → (
                        {move.row},{move.col})
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(move.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Powered by Socket.IO • Real-time collaboration
          </p>
        </div>
      </div>
    </div>
  );
}
