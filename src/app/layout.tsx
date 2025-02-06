import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { CSPostHogProvider } from "./_providers/posthog-provider";

export const metadata: Metadata = {
  title: "Drive",
  description: "It's like GDrive",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${GeistSans.variable}`}>
        <body>
          <CSPostHogProvider>{children}</CSPostHogProvider>
          {/* {children} */}
        </body>
      </html>
    </ClerkProvider>
  );
}
