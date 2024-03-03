import { PokemonList } from "./components/PokemonList";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start space-y-6 p-24">
      <h1>My Pokemon List</h1>
      <PokemonList />
    </main>
  );
}
