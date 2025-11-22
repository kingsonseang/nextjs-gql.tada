"use client";

import { useQuery } from "urql";
import { graphql, readFragment, FragmentOf } from "@/graphql";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getPokemonImageUrl, getPokemonFallbackImageUrl } from "@/app/utils/pokemonImages";
import { downloadPokemonCard } from "@/app/utils/cardDownload";
import { PokemonDetailFragment } from "./PokemonDetailFragments";

interface Props {
  id: string;
}

const PokemonQuery = graphql(
  `
    query Pokemon($id: ID!) {
      pokemon(id: $id) {
        ...PokemonDetail
      }
    }
  `,
  [PokemonDetailFragment]
);

export default function PokemeonView(props: Props): JSX.Element {
  const [imageError, setImageError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [result] = useQuery({
    query: PokemonQuery,
    variables: { id: props.id },
    requestPolicy: "network-only",
  });

  const { data, fetching, error } = result;

  if (error) {
    return (
      <div className="text-center py-8 bg-black min-h-screen">
        <h3 className="text-lg font-semibold text-red-400 mb-2">Oh no!</h3>
        <pre className="text-sm text-red-300">{error.message}</pre>
        <Link href="/" className="mt-4 inline-block text-gray-400 hover:text-gray-300">
          ← Back to Pokemon List
        </Link>
      </div>
    );
  } else if (fetching || !data) {
    return (
      <div className="text-center py-8 bg-black min-h-screen">
        <h3 className="text-lg text-gray-300">Loading...</h3>
      </div>
    );
  }

  const pokemonData = data.pokemon;
  if (!pokemonData) {
    return (
      <div className="text-center py-8 bg-black min-h-screen">
        <h3 className="text-lg text-gray-300">Pokemon not found</h3>
        <Link href="/" className="mt-4 inline-block text-gray-400 hover:text-gray-300">
          ← Back to Pokemon List
        </Link>
      </div>
    );
  }

  // Use readFragment for type-safe access
  const pokemon = readFragment(PokemonDetailFragment, pokemonData);

  const imageUrl = imageError 
    ? getPokemonFallbackImageUrl(pokemon.id) 
    : getPokemonImageUrl(pokemon.id);

  const handleDownload = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    try {
      await downloadPokemonCard({
        id: pokemon.id,
        name: pokemon.name,
        imageUrl: imageUrl,
        types: pokemon.types || [],
      });
    } catch (error) {
      console.error("Failed to download card:", error);
      alert("Failed to download card. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full bg-black min-h-screen p-6">
      <Link href="/" className="inline-flex items-center text-gray-400 hover:text-gray-300 mb-6">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Pokemon List
      </Link>

      <div className="bg-black rounded-lg shadow-lg overflow-hidden border-2 border-gray-800">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-gray-900 to-black p-6 text-white border-b-2 border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{pokemon.name}</h1>
              <p className="text-gray-400">#{pokemon.id.padStart(3, '0')}</p>
            </div>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-4 py-2 bg-gray-900 border-2 border-gray-800 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {isDownloading ? "Downloading..." : "Download Card"}
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Image Section */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="relative w-full md:w-64 h-64 bg-gradient-to-br from-gray-950 to-black rounded-lg overflow-hidden border-2 border-gray-800">
              <Image
                src={imageUrl}
                alt={pokemon.name}
                fill
                className="object-contain p-4"
                onError={() => setImageError(true)}
                sizes="256px"
              />
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4 text-gray-100">Basic Information</h2>
              <div className="grid grid-cols-2 gap-4">
                {pokemon.maxCP && (
                  <div className="bg-gray-900 border-2 border-gray-800 p-3 rounded">
                    <p className="text-sm text-gray-400">Max CP</p>
                    <p className="text-lg font-semibold text-white">{pokemon.maxCP}</p>
                  </div>
                )}
                {pokemon.maxHP && (
                  <div className="bg-gray-900 border-2 border-gray-800 p-3 rounded">
                    <p className="text-sm text-gray-400">Max HP</p>
                    <p className="text-lg font-semibold text-white">{pokemon.maxHP}</p>
                  </div>
                )}
                {pokemon.fleeRate !== null && pokemon.fleeRate !== undefined && (
                  <div className="bg-gray-900 border-2 border-gray-800 p-3 rounded">
                    <p className="text-sm text-gray-400">Flee Rate</p>
                    <p className="text-lg font-semibold text-white">{(pokemon.fleeRate * 100).toFixed(1)}%</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Types */}
          {pokemon.types && pokemon.types.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3 text-gray-100">Types</h2>
              <div className="flex flex-wrap gap-2">
                {pokemon.types.map((type, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gray-900 text-gray-200 border border-gray-800 rounded-full font-medium"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Dimensions */}
          {(pokemon.height || pokemon.weight) && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3 text-gray-100">Dimensions</h2>
              <div className="grid grid-cols-2 gap-4">
                {pokemon.height && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Height</p>
                    <p className="font-medium text-gray-100">
                      {pokemon.height.minimum} - {pokemon.height.maximum}
                    </p>
                  </div>
                )}
                {pokemon.weight && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Weight</p>
                    <p className="font-medium text-gray-100">
                      {pokemon.weight.minimum} - {pokemon.weight.maximum}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resistances & Weaknesses */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {pokemon.resistant && pokemon.resistant.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-3 text-gray-100">Resistant To</h2>
                <div className="flex flex-wrap gap-2">
                  {pokemon.resistant.map((type, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-900 text-gray-200 border border-gray-800 rounded-full text-sm"
                  >
                    {type}
                  </span>
                  ))}
                </div>
              </div>
            )}
            {pokemon.weaknesses && pokemon.weaknesses.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-3 text-gray-100">Weaknesses</h2>
                <div className="flex flex-wrap gap-2">
                  {pokemon.weaknesses.map((type, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-900 text-gray-200 border border-gray-800 rounded-full text-sm"
                  >
                    {type}
                  </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Attacks */}
          {(pokemon.attacks?.fast?.length || pokemon.attacks?.special?.length) && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-100">Attacks</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {pokemon.attacks?.fast && pokemon.attacks.fast.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 text-lg text-gray-200">Fast Attacks</h3>
                    <div className="space-y-2">
                      {pokemon.attacks.fast.map((attack, index) => (
                        <div
                          key={index}
                          className="bg-gray-900 border-2 border-gray-800 p-3 rounded"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-white">{attack?.name}</p>
                              <p className="text-sm text-gray-400">{attack?.type}</p>
                            </div>
                            {attack?.damage && (
                              <span className="px-2 py-1 bg-gray-800 text-gray-200 border border-gray-700 rounded text-sm font-medium">
                                {attack.damage} DMG
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {pokemon.attacks?.special && pokemon.attacks.special.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 text-lg text-gray-200">Special Attacks</h3>
                    <div className="space-y-2">
                      {pokemon.attacks.special.map((attack, index) => (
                        <div
                          key={index}
                          className="bg-gray-900 border-2 border-gray-800 p-3 rounded"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-white">{attack?.name}</p>
                              <p className="text-sm text-gray-400">{attack?.type}</p>
                            </div>
                            {attack?.damage && (
                              <span className="px-2 py-1 bg-gray-800 text-gray-200 border border-gray-700 rounded text-sm font-medium">
                                {attack.damage} DMG
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Evolutions */}
          {pokemon.evolutions && pokemon.evolutions.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-100">Evolutions</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {pokemon.evolutions.map((evolution) => (
                  <Link
                    key={evolution?.id}
                    href={`/${evolution?.id}`}
                    className="bg-gray-900 border-2 border-gray-800 p-4 rounded-lg hover:border-gray-700 hover:shadow-md transition-all"
                  >
                    <p className="font-medium text-white">{evolution?.name}</p>
                    <p className="text-sm text-gray-400">#{evolution?.id?.padStart(3, '0')}</p>
                    {evolution?.types && evolution.types.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {evolution.types.map((type, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-gray-800 text-gray-200 border border-gray-700 rounded text-xs"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
