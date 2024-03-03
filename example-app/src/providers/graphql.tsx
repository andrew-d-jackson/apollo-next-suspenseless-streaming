"use client";

import { useMemo } from "react";
import { ApolloClient, InMemoryCache, ApolloProvider } from "../../../src";

export function GraphqlProvider({ children }: React.PropsWithChildren) {
  const [client] = useMemo(() => {
    const client = new ApolloClient({
      uri: "https://graphql-pokeapi.graphcdn.app/",
      cache: new InMemoryCache(),
    });

    return [client];
  }, []);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
