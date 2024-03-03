"use client";

import styles from "./page.module.css";
import { gql, useQuery } from "../../../src";

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

export default function Home() {
  const queryData = useQuery(gqlQuery, {
    variables: { limit: 10, offset: 0 },
  });

  return (
    <main>
      <button onClick={() => queryData.refetch()}>Refetch</button>
      <div className={styles.description}>
        {queryData.loading ? <div>Loading...</div> : null}
        {queryData.data ? <div>{JSON.stringify(queryData.data)}</div> : null}
      </div>
    </main>
  );
}
