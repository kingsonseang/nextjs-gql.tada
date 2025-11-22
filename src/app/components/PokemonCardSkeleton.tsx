/**
 * Skeleton loader component for Pokemon cards
 */
export function PokemonCardSkeleton() {
  return (
    <div className="bg-black rounded-lg border-2 border-gray-800 overflow-hidden animate-pulse">
      <div className="w-full aspect-square bg-gray-900"></div>
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-900 rounded w-3/4"></div>
        <div className="h-4 bg-gray-900 rounded w-1/2"></div>
        <div className="flex gap-2">
          <div className="h-6 bg-gray-900 rounded w-16"></div>
          <div className="h-6 bg-gray-900 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}

