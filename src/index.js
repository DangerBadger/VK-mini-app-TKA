import React from "react";
import ReactDOM from "react-dom/client";
import bridge from "@vkontakte/vk-bridge";
import {AdaptivityProvider, ConfigProvider } from '@vkontakte/vkui';
import App from "./App";

// Init VK Mini App
bridge.send("VKWebAppInit");

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <ConfigProvider>
    <AdaptivityProvider>
      <App />
    </AdaptivityProvider>
  </ConfigProvider>)

if (process.env.NODE_ENV === "development") {
  import("./eruda").then(({ default: eruda }) => { }); //runtime download
}
