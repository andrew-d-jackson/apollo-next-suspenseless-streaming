"use client";

import { gql, useQuery } from "../../../../src";

const gqlQuery = gql`
  query berries {
    berries {
      count
      next
      previous
      results {
        url
        name
      }
    }
  }
`;

export default function PaegLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryData = useQuery(gqlQuery);
  return (
    <div>
      <h1>Page Layout</h1>
      <p>
        This section is rendered inside a next.js layout component, still works!
      </p>
      <h2>Berries</h2>
      <div>
        {queryData.loading ? <div>Loading Berries...</div> : null}
        {queryData.data ? (
          <div>
            Berries:{" "}
            {queryData.data.berries.results
              .map((x: { name: string }) => x.name)
              .join(", ")}
          </div>
        ) : null}
      </div>
      {children}
    </div>
  );
}
