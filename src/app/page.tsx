"use client";

import { useState } from "react";
import { PokemonList } from "./components/PokemonList";
import { SearchBar } from "./components/SearchBar";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <main className="flex min-h-screen flex-col items-center justify-start space-y-6 p-6 md:p-24 bg-black">
      <h1 className="text-4xl font-bold text-white mb-4">My Pokemon List</h1>
      <SearchBar onSearch={setSearchQuery} />
      <PokemonList searchQuery={searchQuery} />
    </main>
  );
}
