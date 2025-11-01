import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { apiFetch } from "@/lib/apiClient";
import Head from "next/head";
import dynamic from "next/dynamic";
import { SWRConfig } from "swr";

const ChatbotWidget = dynamic(() => import("@/components/ChatbotWidget"), { ssr: false });

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <SWRConfig
        value={{
          fetcher: (resource, config) => apiFetch(resource, config),
          revalidateOnFocus: true,
          shouldRetryOnError: true,
        }}
      >
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <Component {...pageProps} />
        <ChatbotWidget />
      </SWRConfig>
    </AuthProvider>
  );
}

export default MyApp;
