import { describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { buildAdminEntryUrl, createAdminEntryRoute } from '../adminEntryBridge'

describe('admin entry bridge', () => {
  it('matches admin root and nested paths and hands navigation to the separate app', async () => {
    const navigate = vi.fn()
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: { render: () => null } }, createAdminEntryRoute(navigate)]
    })
    await router.push('/')
    expect(router.resolve('/admin').matched).toHaveLength(1)
    expect(router.resolve('/admin/login').matched).toHaveLength(1)
    await router.push('/admin/login?redirect=/dashboard#login')
    expect(navigate).toHaveBeenCalledWith('/admin/login?redirect=/dashboard#login')
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('uses the admin dev server on the same host during local development', () => {
    expect(
      buildAdminEntryUrl('/admin', {
        origin: 'http://localhost:5173',
        dev: true
      })
    ).toBe('http://localhost:5174/admin/')
    expect(
      buildAdminEntryUrl('/admin/users#ls_admin_token=t', {
        origin: 'http://192.168.1.49:5173',
        dev: true
      })
    ).toBe('http://192.168.1.49:5174/admin/users#ls_admin_token=t')
  })

  it('respects a configured admin dev URL', () => {
    expect(
      buildAdminEntryUrl('/admin/users', {
        origin: 'http://localhost:5173',
        dev: true,
        adminDevUrl: 'http://10.0.0.5:6000'
      })
    ).toBe('http://10.0.0.5:6000/admin/users')
  })

  it('uses the current origin for deployed frontend navigation', () => {
    expect(
      buildAdminEntryUrl('/admin/users', {
        origin: 'https://learn.example.test',
        dev: false,
        adminDevUrl: 'http://ignored.test'
      })
    ).toBe('https://learn.example.test/admin/users')
  })

  it('does not treat unrelated paths as admin pages', () => {
    expect(() =>
      buildAdminEntryUrl('/administrator', {
        origin: 'http://localhost:5173',
        dev: true
      })
    ).toThrow()
  })
})
