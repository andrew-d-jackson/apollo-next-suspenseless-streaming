"use client";

import * as React from "react";
import { ServerInsertedHTMLContext } from "next/navigation";
import {
  ApolloClient,
  ApolloProvider as OrigninalApolloProvider,
} from "@apollo/client";

const bootstrapScript = `
  if (window.__apollo_streaming_on_done === undefined) {
    let __apollo_streaming_done = false;
    window.__apollo_streaming_on_done = new Promise((res) => {
      window.__apollo_streaming_on_data = (data) => {
        if(__apollo_streaming_done) {
          return;
        }
        __apollo_streaming_done = true;
        res(data);
      };
    });
  }
`;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const generateCacheTransferScript = (cache: any) =>
  `window.__apollo_streaming_on_data(${JSON.stringify(cache)})`;

interface StreamingContextData {
  markCompletedQuery: () => void;
  markStartedQuery: () => void;
  isHydrated: () => boolean;
}

export const StreamingContext = React.createContext<StreamingContextData>({
  markCompletedQuery: () => {},
  markStartedQuery: () => {},
  isHydrated: () => false,
});

function StreamPipe({
  onCompletedAll,
}: {
  onCompletedAll: (fn: (client: ApolloClient<any>) => void) => void;
}) {
  const alreadyRan = React.useRef(false);
  const insertHtml = React.useContext(ServerInsertedHTMLContext);

  React.use(
    typeof window === "undefined"
      ? new Promise((res) => {
          if (alreadyRan.current) {
            return res(null);
          }
          alreadyRan.current = true;

          insertHtml?.(() =>
            React.createElement("script", {
              dangerouslySetInnerHTML: {
                __html: bootstrapScript,
              },
            })
          );

          onCompletedAll((client) => {
            const cache = client.cache.extract();
            insertHtml?.(() =>
              React.createElement("script", {
                dangerouslySetInnerHTML: {
                  __html: generateCacheTransferScript(cache),
                },
              })
            );
            res(null);
          });
        })
      : Promise.resolve(null)
  );

  return null;
}

export function ApolloProvider({
  children,
  client,
}: React.PropsWithChildren<{
  client: ApolloClient<any>;
}>) {
  const [restoredOnClient, setRestoredOnClient] = React.useState(false);
  const hydratedOnClient = React.useRef(false);
  const [, transition] = React.useTransition();

  const queryCount = React.useRef(0);
  const queryStarted = React.useRef(false);

  const completedListener = React.useRef<(client: ApolloClient<any>) => void>(
    () => {}
  );

  const contextValues = React.useMemo(() => {
    return {
      markCompletedQuery: () => {
        queryCount.current--;
        if (queryCount.current === 0) {
          completedListener.current(client);
        }
      },
      markStartedQuery: () => {
        queryCount.current++;
        queryStarted.current = true;
      },
      isHydrated: () => hydratedOnClient.current,
    };
  }, []);

  const { onCompletedAll } = React.useMemo(() => {
    return {
      onCompletedAll: (fn: (client: ApolloClient<any>) => void) => {
        completedListener.current = fn;
      },
    };
  }, []);

  React.useEffect(() => {
    if (
      typeof window !== "undefined" &&
      (window as any).__apollo_streaming_on_done
    ) {
      (window as any).__apollo_streaming_on_done.then((cache: any) => {
        client.cache.restore(cache);
        transition(() => {
          setRestoredOnClient(true);
          hydratedOnClient.current = true;
        });
      });
    }
  }, []);

  return (
    <StreamingContext.Provider value={contextValues}>
      <StreamPipe onCompletedAll={onCompletedAll} />
      <OrigninalApolloProvider
        key={restoredOnClient ? "0" : "1"}
        client={client}
      >
        {children}
      </OrigninalApolloProvider>
    </StreamingContext.Provider>
  );
}
