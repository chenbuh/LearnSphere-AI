import { describe, expect, it, vi } from 'vitest'
import { syncSystemConfigForGuard } from '../systemConfigGuard'

describe('syncSystemConfigForGuard', () => {
  it('uses blocking fetch on first load', async () => {
    const fetchSystemConfig = vi.fn().mockResolvedValue(undefined)
    const refreshSystemConfigInBackground = vi.fn().mockResolvedValue(undefined)

    const systemStore = {
      hasConfig: false,
      fetchSystemConfig,
      refreshSystemConfigInBackground
    }

    const customLogger = { warn: vi.fn() }
    await syncSystemConfigForGuard(systemStore, customLogger)

    expect(fetchSystemConfig).toHaveBeenCalledTimes(1)
    expect(refreshSystemConfigInBackground).not.toHaveBeenCalled()
    expect(customLogger.warn).not.toHaveBeenCalled()
  })

  it('logs warning when first-load fetch fails', async () => {
    const fetchSystemConfig = vi.fn().mockRejectedValue(new Error('network'))
    const systemStore = {
      hasConfig: false,
      fetchSystemConfig,
      refreshSystemConfigInBackground: vi.fn()
    }

    const customLogger = { warn: vi.fn() }
    await syncSystemConfigForGuard(systemStore, customLogger)

    expect(customLogger.warn).toHaveBeenCalledTimes(1)
    expect(customLogger.warn.mock.calls[0][0]).toContain('bootstrap failed')
  })

  it('uses non-blocking refresh when config already exists', async () => {
    const fetchSystemConfig = vi.fn().mockResolvedValue(undefined)
    const refreshSystemConfigInBackground = vi.fn().mockResolvedValue(undefined)

    const systemStore = {
      hasConfig: true,
      fetchSystemConfig,
      refreshSystemConfigInBackground
    }

    const customLogger = { warn: vi.fn() }
    await syncSystemConfigForGuard(systemStore, customLogger)

    expect(fetchSystemConfig).not.toHaveBeenCalled()
    expect(refreshSystemConfigInBackground).toHaveBeenCalledTimes(1)
  })

  it('logs warning when background refresh fails', async () => {
    const refreshSystemConfigInBackground = vi.fn().mockRejectedValue(new Error('timeout'))
    const systemStore = {
      hasConfig: true,
      fetchSystemConfig: vi.fn(),
      refreshSystemConfigInBackground
    }
    const customLogger = { warn: vi.fn() }

    await syncSystemConfigForGuard(systemStore, customLogger)
    await Promise.resolve()

    expect(customLogger.warn).toHaveBeenCalledTimes(1)
    expect(customLogger.warn.mock.calls[0][0]).toContain('background refresh failed')
  })
})
