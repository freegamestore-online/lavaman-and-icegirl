// App.tsx
import { GameShell, GameTopbar } from "@freegamestore/games";
import { Game } from "./Game";

export default function App() {
  return (
    <GameShell topbar={<GameTopbar title="Lavaman and Icegirl" score={0} />}>
      <Game />
    </GameShell>
  );
}