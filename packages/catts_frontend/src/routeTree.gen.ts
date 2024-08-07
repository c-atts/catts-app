/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'

// Create Virtual Routes

const HistoryLazyImport = createFileRoute('/history')()
const DashboardLazyImport = createFileRoute('/dashboard')()
const CreateLazyImport = createFileRoute('/create')()
const IndexLazyImport = createFileRoute('/')()
const UserAddressLazyImport = createFileRoute('/user/$address')()
const RecipeRecipeNameLazyImport = createFileRoute('/recipe/$recipeName')()

// Create/Update Routes

const HistoryLazyRoute = HistoryLazyImport.update({
  path: '/history',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/history.lazy').then((d) => d.Route))

const DashboardLazyRoute = DashboardLazyImport.update({
  path: '/dashboard',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/dashboard.lazy').then((d) => d.Route))

const CreateLazyRoute = CreateLazyImport.update({
  path: '/create',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/create.lazy').then((d) => d.Route))

const IndexLazyRoute = IndexLazyImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/index.lazy').then((d) => d.Route))

const UserAddressLazyRoute = UserAddressLazyImport.update({
  path: '/user/$address',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/user.$address.lazy').then((d) => d.Route))

const RecipeRecipeNameLazyRoute = RecipeRecipeNameLazyImport.update({
  path: '/recipe/$recipeName',
  getParentRoute: () => rootRoute,
} as any).lazy(() =>
  import('./routes/recipe.$recipeName.lazy').then((d) => d.Route),
)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/create': {
      id: '/create'
      path: '/create'
      fullPath: '/create'
      preLoaderRoute: typeof CreateLazyImport
      parentRoute: typeof rootRoute
    }
    '/dashboard': {
      id: '/dashboard'
      path: '/dashboard'
      fullPath: '/dashboard'
      preLoaderRoute: typeof DashboardLazyImport
      parentRoute: typeof rootRoute
    }
    '/history': {
      id: '/history'
      path: '/history'
      fullPath: '/history'
      preLoaderRoute: typeof HistoryLazyImport
      parentRoute: typeof rootRoute
    }
    '/recipe/$recipeName': {
      id: '/recipe/$recipeName'
      path: '/recipe/$recipeName'
      fullPath: '/recipe/$recipeName'
      preLoaderRoute: typeof RecipeRecipeNameLazyImport
      parentRoute: typeof rootRoute
    }
    '/user/$address': {
      id: '/user/$address'
      path: '/user/$address'
      fullPath: '/user/$address'
      preLoaderRoute: typeof UserAddressLazyImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren({
  IndexLazyRoute,
  CreateLazyRoute,
  DashboardLazyRoute,
  HistoryLazyRoute,
  RecipeRecipeNameLazyRoute,
  UserAddressLazyRoute,
})

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/create",
        "/dashboard",
        "/history",
        "/recipe/$recipeName",
        "/user/$address"
      ]
    },
    "/": {
      "filePath": "index.lazy.tsx"
    },
    "/create": {
      "filePath": "create.lazy.tsx"
    },
    "/dashboard": {
      "filePath": "dashboard.lazy.tsx"
    },
    "/history": {
      "filePath": "history.lazy.tsx"
    },
    "/recipe/$recipeName": {
      "filePath": "recipe.$recipeName.lazy.tsx"
    },
    "/user/$address": {
      "filePath": "user.$address.lazy.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
