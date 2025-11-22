"use client";

import { useQuery } from "urql";
import { useEffect, useRef, useState, useMemo } from "react";
import { graphql, FragmentOf, readFragment } from "@/graphql";
import { PokemonItem, PokemonItemFragment } from "./PokemonItem";
import { PokemonCardSkeleton } from "./PokemonCardSkeleton";

const POKEMONS_PER_PAGE = 20;

const PokemonsQuery = graphql(
  `
    query Pokemons($limit: Int, $skip: Int) {
      pokemons(limit: $limit, skip: $skip) {
        id
        ...PokemonItem
      }
    }
  `,
  [PokemonItemFragment]
);

interface PokemonListProps {
  searchQuery?: string;
}

const PokemonList = ({ searchQuery = "" }: PokemonListProps) => {
  const [skip, setSkip] = useState(0);
  const [allPokemons, setAllPokemons] = useState<Array<FragmentOf<typeof PokemonItemFragment> | null>>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const [result] = useQuery({
    query: PokemonsQuery,
    variables: { limit: POKEMONS_PER_PAGE, skip: searchQuery.trim() ? 0 : skip },
    requestPolicy: skip === 0 && !searchQuery.trim() ? "cache-and-network" : "cache-first",
    pause: false,
  });

  const { data, fetching, error } = result;

  // Update allPokemons when new data arrives
  useEffect(() => {
    if (data?.pokemons) {
      const pokemons = data.pokemons || [];
      if (skip === 0 || searchQuery.trim()) {
        // First load, reset, or search
        setAllPokemons(pokemons);
        setHasMore(pokemons.length === POKEMONS_PER_PAGE);
        setIsInitialLoad(false);
      } else {
        // Append new data for pagination
        setAllPokemons((prev) => [...prev, ...pokemons]);
        setHasMore(pokemons.length === POKEMONS_PER_PAGE);
      }
    }
  }, [data, skip, searchQuery]);

  // Reset when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      // Search cleared - always reset to show all pokemon from beginning
      setSkip(0);
      setAllPokemons([]);
      setHasMore(true);
      setIsInitialLoad(true);
    }
    // When search is active, filtering happens client-side, no need to reset skip
  }, [searchQuery]);

  // Filter pokemons based on search query
  const filteredPokemons = useMemo(() => {
    if (!searchQuery.trim()) {
      return allPokemons;
    }
    const query = searchQuery.toLowerCase();
    return allPokemons.filter((pokemon) => {
      if (!pokemon) return false;
      const pokemonData = readFragment(PokemonItemFragment, pokemon);
      if (!pokemonData) return false;
      const name = pokemonData.name?.toLowerCase() || "";
      const id = pokemonData.id?.toLowerCase() || "";
      return name.includes(query) || id.includes(query);
    });
  }, [allPokemons, searchQuery]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || fetching || !hasMore || searchQuery.trim()) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !fetching) {
          setSkip((prev) => prev + POKEMONS_PER_PAGE);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [fetching, hasMore, searchQuery]);

  if (error) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold text-red-400 mb-2">Oh no!</h3>
        <pre className="text-sm text-red-300">{error.message}</pre>
      </div>
    );
  }

  // Show loading skeletons on initial load
  if (isInitialLoad && (fetching || !data)) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: POKEMONS_PER_PAGE }).map((_, i) => (
            <PokemonCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Show empty state only if we have data and no results
  if (filteredPokemons.length === 0 && !fetching && !isInitialLoad) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg text-gray-300">
          {searchQuery.trim() ? "No Pokemon found matching your search." : "Your Pokedex is empty."}
        </h3>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredPokemons.map((pokemon, index) => (
          <PokemonItem data={pokemon} key={pokemon?.id || index} />
        ))}
        {/* Show skeleton loaders while fetching more */}
        {fetching && hasMore && !searchQuery.trim() && (
          <>
            {Array.from({ length: POKEMONS_PER_PAGE }).map((_, i) => (
              <PokemonCardSkeleton key={`skeleton-${i}`} />
            ))}
          </>
        )}
      </div>
      
      {/* Load more trigger and end message */}
      {!searchQuery.trim() && (
        <div ref={loadMoreRef} className="h-10 flex items-center justify-center py-8">
          {!hasMore && allPokemons.length > 0 && (
            <p className="text-gray-400">You've reached the end of the Pokédex!</p>
          )}
        </div>
      )}
    </div>
  );
};

export { PokemonList };
