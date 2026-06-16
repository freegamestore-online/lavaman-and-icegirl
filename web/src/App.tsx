import { GameShell, GameTopbar } from "@freegamestore/games";
import { Game } from "./components/Game";

export default function App() {
  return (
    <GameShell topbar={<GameTopbar title="Fire and Water" score={0} />}>
      <Game />
    </GameShell>
  );
}