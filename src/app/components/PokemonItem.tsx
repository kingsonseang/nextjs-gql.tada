import { FragmentOf, graphql, readFragment } from "@/graphql";
import Link from "next/link";

export const PokemonItemFragment = graphql(`
  fragment PokemonItem on Pokemon {
    id
    name
  }
`);

interface Props {
  data: FragmentOf<typeof PokemonItemFragment> | null;
}

const PokemonItem = ({ data }: Props) => {
  const pokemon = readFragment(PokemonItemFragment, data);
  if (!pokemon) {
    return null;
  }

  return (
    <li>
      <Link href={pokemon.id as string}>{pokemon.name}</Link>
    </li>
  );
};

export { PokemonItem };
