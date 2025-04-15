import { StrictMode } from "react";
import { BrowserRouter } from "react-router-dom";

import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import ErrorBoundary from "../src/ErrorBoundary.js";
import ServerError from "../src/500.jsx";
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary fallback={<ServerError />}>
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);
