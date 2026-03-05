function walkRoutes(routes, visitor) {
  if (!Array.isArray(routes) || typeof visitor !== 'function') {
    return
  }

  routes.forEach(route => {
    if (!route || typeof route !== 'object') {
      return
    }

    visitor(route)

    if (Array.isArray(route.children) && route.children.length > 0) {
      walkRoutes(route.children, visitor)
    }
  })
}

export function collectPreloadLoaders(routes, priority) {
  const loaders = []

  walkRoutes(routes, route => {
    if (route.meta?.preload && route.meta?.priority === priority && typeof route.component === 'function') {
      loaders.push(route.component)
    }
  })

  return loaders
}
