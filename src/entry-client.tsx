import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.hydrateRoot(
  document.getElementById("app") as HTMLElement,
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
