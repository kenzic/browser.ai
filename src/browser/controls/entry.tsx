import React from "react";
import { createRoot } from "react-dom/client";
import { Control } from "./index";

const container = document.getElementById("app");
if (container) {
  const root = createRoot(container);
  root.render(<Control />);
} else {
  console.error("Failed to find the app container");
}
