import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { AppProvider } from "@/context/AppContext";
import { router } from "@/lib/router";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <AppProvider>
    <RouterProvider router={router} />
  </AppProvider>
);
