"use client";

import { gql, useQuery } from "apollo-next-suspenseless-streaming";
import Link from "next/link";

const gqlQuery = gql`
  query pokemons($limit: Int, $offset: Int) {
    pokemons(limit: $limit, offset: $offset) {
      count
      next
      previous
      status
      message
      results {
        url
        name
        image
      }
    }
  }
`;
export const dynamic = "force-dynamic";
export default function Home() {
  const queryData = useQuery(gqlQuery, {
    variables: { limit: 10, offset: 0 },
  });

  return (
    <main>
      <h1>Simple page</h1>
      <p>
        This is a simple page that makes a graphql call using apollo client. You
        should see it loading and then see data, if you look into the network
        tab of chrome you should see no graphql requests on initial load, the
        results are streamed in. If you press refetch you will see the graphql
        call made locally.
      </p>
      <p>
        You can go to{" "}
        <Link
          style={{ color: "blue", textDecoration: "underline" }}
          href="/page2"
        >
          Another Page
        </Link>
        , if you go there from here that pages graphql calls will be made
        locally. But if you refresh that page they will be streamed in.
      </p>
      <p>
        You can also go to{" "}
        <Link
          style={{ color: "blue", textDecoration: "underline" }}
          href="/noqueries"
        >
          A page with no queries
        </Link>
        , to see that that still works
      </p>

      <h2>List of pokemon:</h2>
      <button onClick={() => queryData.refetch()}>Refetch</button>
      <div>
        {queryData.loading ? <div>Loading...</div> : null}
        {queryData.data ? (
          <ul>
            {queryData.data.pokemons.results.map((p: { name: string }) => (
              <li key={p.name}>{p.name}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </main>
  );
}
