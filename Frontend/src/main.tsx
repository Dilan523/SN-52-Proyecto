import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { AlertProvider } from "./context/AlertContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <AlertProvider>
          <App />
        </AlertProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);
