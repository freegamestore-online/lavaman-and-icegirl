// App.tsx
import { GameShell, GameTopbar } from "@freegamestore/games";
import { Game } from "./Game";
import { GAME_TITLE } from "./branding";

export default function App() {
  return (
    <GameShell topbar={<GameTopbar title={GAME_TITLE} score={0} />}>
      <Game />
    </GameShell>
  );
}