import "bootstrap";
import "./main.scss";

import { AppProvider } from "@/react/app-provider";
import { ROParams } from "@/url";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app";

/**
 * Create a new React Query client.
 */
const RQ_CLIENT = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: ROParams.rqStaleTime,
        },
    },
});

/**
 * Render the application into the root element.
 */
const $app_root = document.getElementById("app-root");
createRoot($app_root as HTMLElement).render(
    <StrictMode>
        <AppProvider>
            <QueryClientProvider client={RQ_CLIENT}>
                <App />
                {
                    // import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />
                }
            </QueryClientProvider>
        </AppProvider>
    </StrictMode>,
);
