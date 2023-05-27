import React from "react";
import ReactDOM from "react-dom/client";
import WrappedApp from "./App.tsx";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <React.StrictMode>
      <WrappedApp />
    </React.StrictMode>
  </QueryClientProvider>
);
