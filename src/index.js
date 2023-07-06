import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Account from "./pages/Account/Account";
import Home from "./pages/Home/Home";
import Main from "./pages/Main/Main";
import View from "./pages/View/View";

const Router = createBrowserRouter(
  [
    { path: "/", element: <App /> },
    { path: "/home", element: <Home /> },
    { path: "/account", element: <Account /> },
    { path: "/view", element: <View /> },
  ],
  { basename: "/" }
); // add your base name here

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RouterProvider router={Router} />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
