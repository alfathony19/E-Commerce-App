import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { Buffer } from "buffer";
import App from "./App";

// Import TailwindCSS
import "./index.css";
import "./i18n";

if (!(window as any).Buffer) {
  (window as any).Buffer = Buffer;
}
// Render aplikasi
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
    <App />
    </HelmetProvider>
  </React.StrictMode>
);
