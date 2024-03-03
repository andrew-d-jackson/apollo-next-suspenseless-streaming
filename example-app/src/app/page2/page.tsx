"use client";

import React, { Suspense, lazy } from "react";
import { gql, useQuery } from "../../../../src";
import Link from "next/link";

const LazyComponent = lazy(() => import("./lazyComponent"));

const gqlQuery = gql`
  query abilities {
    abilities {
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

export default function Page() {
  return (
    <Suspense fallback={<p>Loading Suspense</p>}>
      <PageInner />
    </Suspense>
  );
}
export const dynamic = "force-dynamic";
function PageInner() {
  const queryData = useQuery(gqlQuery);

  return (
    <main>
      <h1>Inside a Suspense</h1>
      <p>
        This page is inside a suspense that contains a lazyily loaded component.{" "}
        <Link style={{ color: "blue", textDecoration: "underline" }} href="/">
          Go back to the main page
        </Link>
      </p>
      <LazyComponent />
      <h2>Pokemon Abilities:</h2>
      <div>
        {queryData.loading ? <div>Loading Abilities...</div> : null}
        {queryData.data ? (
          <div>
            Abilties:{" "}
            {queryData.data.abilities.results
              .map((x: { name: string }) => x.name)
              .join(", ")}
          </div>
        ) : null}
      </div>
    </main>
  );
}
