"use client";

import { FragmentOf, graphql, readFragment } from "@/graphql";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { getPokemonImageUrl, getPokemonFallbackImageUrl } from "@/app/utils/pokemonImages";
import { downloadPokemonCard } from "@/app/utils/cardDownload";

export const PokemonItemFragment = graphql(`
  fragment PokemonItem on Pokemon {
    id
    name
    types
  }
`);

interface Props {
  data: FragmentOf<typeof PokemonItemFragment> | null;
}

const PokemonItem = ({ data }: Props) => {
  const pokemon = readFragment(PokemonItemFragment, data);
  const [imageError, setImageError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!pokemon) {
    return null;
  }

  const imageUrl = imageError 
    ? getPokemonFallbackImageUrl(pokemon.id) 
    : getPokemonImageUrl(pokemon.id);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isDownloading) return;
    
    setIsDownloading(true);
    try {
      await downloadPokemonCard({
        id: pokemon.id,
        name: pokemon.name,
        imageUrl: imageUrl,
        types: (pokemon.types || []).filter((type) => type !== null) as string[],
      });
    } catch (error) {
      console.error("Failed to download card:", error);
      alert("Failed to download card. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <li className="list-none">
      <div className="group relative bg-black rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 overflow-hidden border-2 border-gray-800">
        <Link href={pokemon.id as string} className="block">
          <div className="relative w-full aspect-square bg-gradient-to-br from-gray-950 to-black">
            <Image
              src={imageUrl}
              alt={pokemon.name}
              fill
              className="object-contain p-4"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg text-white mb-1">
              {pokemon.name}
            </h3>
            <p className="text-sm text-gray-400 mb-2">#{pokemon.id.padStart(3, '0')}</p>
            {pokemon.types && pokemon.types.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {pokemon.types.map((type, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs font-medium rounded-full bg-gray-800 text-gray-200 border border-gray-700"
                  >
                    {type}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Link>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="absolute top-2 right-2 p-2 bg-gray-900 border-2 border-gray-700 rounded-full shadow-md hover:bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-50"
          title="Download card"
          aria-label="Download Pokemon card"
        >
          {isDownloading ? (
            <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          )}
        </button>
      </div>
    </li>
  );
};

export { PokemonItem };
