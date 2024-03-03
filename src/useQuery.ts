import {
  DocumentNode,
  NoInfer,
  OperationVariables,
  QueryHookOptions,
  QueryResult,
  TypedDocumentNode,
  useQuery as original_useQuery,
  useApolloClient,
} from "@apollo/client";
import React from "react";
import { StreamingContext } from "./ApolloProvider";

export const useQuery = <
  TData = any,
  TVariables extends OperationVariables = OperationVariables
>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: QueryHookOptions<NoInfer<TData>, NoInfer<TVariables>>
): QueryResult<TData, TVariables> => {
  const streamingContext = React.useContext(StreamingContext);

  if (typeof window !== "undefined") {
    return original_useQuery(
      query,
      streamingContext.isHydrated()
        ? options
        : { ...options, fetchPolicy: "cache-only" }
    );
  }

  const client = useApolloClient();
  streamingContext.markStartedQuery();
  client
    .query({ query: query, variables: options?.variables })
    .catch(() => {})
    .finally(() => {
      streamingContext.markCompletedQuery();
    });

  return {
    data: undefined,
    loading: true,
    error: undefined,
  } as any;
};
