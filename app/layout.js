import { Inter } from "next/font/google";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "VodSurf.org",
  description: "Random VODs from streamers",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      style={{
        backgroundColor: "#1a202c",
      }}
    >
      <body
        className={inter.className}
        style={{
          padding: 0,
          margin: 0,
          height: "100vh",
          width: "100%",
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
