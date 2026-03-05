import { createRouter, createRootRoute, createRoute } from "@tanstack/react-router";

import RootLayout from "./layouts/RootLayout";
import Home from "./pages/Home";

const rootRoute = createRootRoute({
  component: RootLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
]);

export const router = createRouter({
  routeTree,
});