# Apollo Next Suspenseless Streaming Client

## !!Do not use this anywhere near production, this is an experimental proof of concept written in a few hours, not something to be actually used. The code is horrible and probably broken in many ways!!

This is a proof of concept for using apollo client as you would in an SPA (without the developer needing to use suspense, and just using `{data, loading, error} = useQuery()`) in next.js, but still getting the benefits of data streaming. It's very quickly written and probably breaks in a lot of scenarios, but I converted a previous SPA I wrote to use this and it seems to work fine. Hopefully someone who knows more about apollo/next/react internals can re-write this in a more robust way if they think it's cool.

## Usage

Just use this package instead of `@apollo/client` everywhere in your app, it should just work.

## Example App

To run the exaple app cd into this folder:

- `yarn`
- `cd example-app`
- `yarn`
- `yarn dev`

Now open localhost:3000 in the browser, you'll notice that the ui renders in a loading state and then displays the data without any graphql requests on the client: it was streamed over. If you press the refetch button that request will be made on the client. Now if you look at the code in `page.tsx` you'll see that it's just a regular useQuery call and there is no suspense needed anywhere in the tree.

## Rationale

Streaming data is really cool: it allows us to ship ui to the user super fast and before the data is ready, but doesn't need the client to send us another request to start fetching that data. We get UI quick and we get the data quick. The way that almost everyone in the react world is doing this is by using suspense boundaries, but suspense has a major problem: it colocates the data fetching with the ui. In the old world where we had `{data, loading, error} = useSomeQuery()` we could do whatever we want with the state of the query without having to affect any ui. If we wanted to have a query at the very root of our vdom and pass the data/loading state down to multiple places at the bottom of the vdom we could do that. With suspense this gets problematic because the whole section of the tree where the query is will need to be suspended, and you end up writing very complicated fallback components or having complicated transition logic. When you combine multiple queries with multiple different loading states in a page it can get very messy. In my opinion, the `{data, loading, error} = useSomeQuery()` is much simpler and a better DX. I don't understand why we can't use it and still stream.

The other rationale is that if you have an existing SPA it can be quite an undertaking to convert all your apollo queries to use suspense if you want the benefits of streaming. It would be great if we could get the benefits of streaming without having to change any code.

I wrote this to prove to myself that it's possible to get the benefits of streaming and keep the SPA style of querying. I am probably missing something major because I don't know why this isn't already bieng done everywhere already, hopefully someone will see this and tell me why I'm an idiot.

## How it works

Timeline:

- We SSR the page on the server, with a modified apollo client and useQuery.
- During SSR we render all queries as if they are loading
- We ship the SSR'd page to the client
- In the background we start fetching the data for the queries on the server
- The client rehydrates the page but the modified apollo client stops it from ever fetching any data, it should just display everything as loading.
- When all the data has been loaded on the server we extract the cache and stream it over to the client
- The client will then update it's cache to the one streamed down, rerender the ui and then switch to regular SPA behaviour.

## Future improvements that could be made

Ideally i'd like to be able to specify in the query options when a query should get data and render: something like `{ renderPolicy: 'stream' | 'ssr' | 'client' }`. `stream` would mean that the query should be streamed as it now is in this package. `ssr` would mean that the query should be fetched and rendered during SSR for SEO reasons. `client` would mean that the query is never ran on the server and would be performed on the client once hydrated.

The way I figure out when all the queries have finished fetching on the server is really dumb and very brittle. There is almost definitley a better way of doing this.

I use a react.use promise to keep the next.js stream alive, which seems to work ok but does mean that the data gets sent multiple times. I don't know the nextjs or react internals well enough to know the proper way to achieve what I want.

I update a key on the ApolloProvider to cause a massive re-render once we have hydrated the cache from the server because it's the only way I could get the ui to re-render. There is definitley a better way to do this.
