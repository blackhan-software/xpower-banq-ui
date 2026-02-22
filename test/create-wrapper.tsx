import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

export function createWrapper() {
    const client = new QueryClient({
        defaultOptions: {
            queries: { retry: false, gcTime: 0 },
        },
    });
    return function Wrapper({ children }: { children: React.ReactNode }) {
        return React.createElement(
            QueryClientProvider, { client }, children,
        );
    };
}
