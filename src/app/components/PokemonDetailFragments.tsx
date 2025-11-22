import { graphql } from "@/graphql";

/**
 * Fragment for Pokemon attack information
 */
export const AttackFragment = graphql(`
  fragment Attack on Attack {
    name
    damage
    type
  }
`);

/**
 * Fragment for Pokemon evolution requirements
 */
export const EvolutionRequirementFragment = graphql(`
  fragment EvolutionRequirement on EvolutionRequirement {
    amount
    name
  }
`);

/**
 * Fragment for Pokemon dimensions
 */
export const PokemonDimensionFragment = graphql(`
  fragment PokemonDimension on PokemonDimension {
    minimum
    maximum
  }
`);

/**
 * Fragment for basic Pokemon evolution info
 */
export const PokemonEvolutionFragment = graphql(`
  fragment PokemonEvolution on Pokemon {
    id
    name
    types
  }
`);

/**
 * Comprehensive fragment for Pokemon detail view
 * Composes smaller fragments for better reusability
 */
export const PokemonDetailFragment = graphql(
  `
    fragment PokemonDetail on Pokemon {
      id
      name
      types
      resistant
      weaknesses
      maxCP
      maxHP
      fleeRate
      height {
        ...PokemonDimension
      }
      weight {
        ...PokemonDimension
      }
      attacks {
        fast {
          ...Attack
        }
        special {
          ...Attack
        }
      }
      evolutions {
        ...PokemonEvolution
      }
    }
  `,
  [PokemonDimensionFragment, AttackFragment, PokemonEvolutionFragment]
);

