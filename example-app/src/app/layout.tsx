import type { Metadata } from "next";
import { GraphqlProvider } from "@/providers/graphql";

export const metadata: Metadata = {
  title: "apollo-next-suspenseless-streaming",
  description: "apollo-next-suspenseless-streaming",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <GraphqlProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </GraphqlProvider>
  );
}
