import { describe, expect, it } from 'vitest'
import { collectPreloadLoaders } from '../routePreload'

describe('collectPreloadLoaders', () => {
  it('collects nested route loaders by priority', () => {
    const highLoader = () => Promise.resolve('high')
    const mediumLoader = () => Promise.resolve('medium')

    const routes = [
      {
        path: '/app',
        children: [
          {
            path: 'dashboard',
            component: highLoader,
            meta: { preload: true, priority: 'high' }
          },
          {
            path: 'review',
            component: mediumLoader,
            meta: { preload: true, priority: 'medium' }
          }
        ]
      }
    ]

    expect(collectPreloadLoaders(routes, 'high')).toEqual([highLoader])
    expect(collectPreloadLoaders(routes, 'medium')).toEqual([mediumLoader])
  })

  it('ignores non-preload routes and non-function components', () => {
    const highLoader = () => Promise.resolve('high')

    const routes = [
      {
        path: '/landing',
        component: highLoader,
        meta: { preload: false, priority: 'high' }
      },
      {
        path: '/broken',
        component: 'NotAFunction',
        meta: { preload: true, priority: 'high' }
      }
    ]

    expect(collectPreloadLoaders(routes, 'high')).toEqual([])
  })
})
