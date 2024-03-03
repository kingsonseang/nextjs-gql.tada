"use client";

import { useQuery } from "urql";
import { graphql } from "@/graphql";

interface Props {
  id: string;
}

const PokemonQuery = graphql(
  `
    query Pokemon($id: ID!) {
      pokemon(id: $id) {
        id
        name
        attacks {
          fast {
            name
            damage
          }
          special {
            name
            damage
          }
        }
        types
      }
    }
  `
);

export default function PokemeonView(props: Props): JSX.Element {
  const [result] = useQuery({
    query: PokemonQuery,
    variables: { id: props.id },
    requestPolicy: "network-only",
  });

  const { data, fetching, error } = result;

  if (error) {
    return (
      <>
        <h3>Oh no!</h3>
        <pre>{error.message}</pre>
      </>
    );
  } else if (fetching || !data) {
    return <h3>Loading...</h3>;
  }

  console.log(data);

  return (
    <div className="space-y-3.5">
      <h1 className="text-xl text-center font-semibold">{data.pokemon?.name}</h1>

      <p>Pokemon profile</p>

      <div className="flex text-sm space-x-5">
        <h2 className="font-mono min-w-48">Attacks</h2>
        <div className="space-y-2.5">
          <div className="flex flex-col space-y-1.5">
            <b>Fast Attacks</b>
            {data.pokemon?.attacks?.fast?.map((attack) => {
              return (
                <div
                  className="flex justify-between items-center gap-3"
                  key={attack?.name}
                >
                  <p>{attack?.name}</p>
                  <p>{attack?.damage}</p>
                </div>
              );
            })}
          </div>
          <div className="flex flex-col space-y-1.5">
            <b>Special Attacks</b>
            {data.pokemon?.attacks?.special?.map((attack) => {
              return (
                <div
                  className="flex justify-between items-center gap-3"
                  key={attack?.name}
                >
                  <p>{attack?.name}</p>
                  <p>{attack?.damage}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex text-sm space-x-5">
        <h2 className="font-mono min-w-48">Type</h2>

        <div className="space-y-2.5">
          <div className="flex flex-col space-y-1.5">
            <p>{data.pokemon?.types}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
