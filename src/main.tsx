import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { AuthProvider } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { router } from "@/lib/router";
import { Toaster } from "sonner";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <AppProvider>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" closeButton />
    </AppProvider>
  </AuthProvider>
);
