import "./client/index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./client/App";

ReactDOM.hydrateRoot(
  document.getElementById("app") as HTMLElement,
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
