"use client"

import { Client, Provider, cacheExchange, fetchExchange } from "urql";

const client = new Client({
  url: "https://trygql.formidable.dev/graphql/basic-pokedex",
  exchanges: [cacheExchange, fetchExchange],
});

interface Props {
  children: React.ReactNode;
}

export function UrqlProvider(props: Props): JSX.Element {
  return <Provider value={client}>{props.children}</Provider>;
}
