import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import ErrorBoundary from "../src/ErrorBoundary.js";
import ServerError from "../src/500.jsx";
createRoot(document.getElementById("root")).render(
  <ErrorBoundary fallback={<ServerError/>}>
    <App />
  </ErrorBoundary>
);
