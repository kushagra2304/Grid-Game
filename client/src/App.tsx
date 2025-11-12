import Grid from "./components/Grid";

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Multiplayer Unicode Grid</h1>
      <Grid />
    </div>
  );
}

export default App;
