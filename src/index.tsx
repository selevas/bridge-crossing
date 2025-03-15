import React from "react";
import ReactDOM from "react-dom/client";
import AppView from "./ts/views/AppView/AppView";
import "./css/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppView />
  </React.StrictMode>
);
