import React, { createContext } from "react";
import ReactDOM from "react-dom/client";
import ControllerContext from "/src/ts/contexts/controller";
import AppController from "/src/ts/controller";
import AppView from "./ts/views/AppView/AppView";
import "./css/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ControllerContext.Provider value={new AppController()}>
      <AppView />
    </ControllerContext.Provider>
  </React.StrictMode>
);
