import { createBrowserRouter, Navigate } from "react-router";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Parents from "./pages/Parents";
import Counselors from "./pages/Counselors";
import Districts from "./pages/Districts";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Landing },
      { path: "parents", Component: Parents },
      { path: "counselors", Component: Counselors },
      { path: "districts", Component: Districts },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
