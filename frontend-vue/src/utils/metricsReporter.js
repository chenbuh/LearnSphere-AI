const METRICS_ENDPOINT = `${import.meta.env.VITE_API_URL || '/api'}/metrics/frontend`
const FLUSH_INTERVAL_MS = 10000
const MAX_BATCH_SIZE = 20

const queue = []
let initialized = false

const getConnectionType = () => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  return connection?.effectiveType || 'unknown'
}

const normalizePath = path => {
  if (!path) return ''
  return path.replace(/\\/\\d+/g, '/:id')
}

const enqueue = metric => {
  if (!metric || !metric.type) return
  queue.push({
    ...metric,
    timestamp: Date.now(),
    path: metric.path || window.location.pathname,
    connection: metric.connection || getConnectionType(),
    userAgent: metric.userAgent || navigator.userAgent
  })

  if (queue.length >= MAX_BATCH_SIZE) {
    flush()
  }
}

const flush = () => {
  if (!queue.length) return
  const batch = queue.splice(0, MAX_BATCH_SIZE)
  const payload = JSON.stringify({ metrics: batch })

  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: 'application/json' })
    const ok = navigator.sendBeacon(METRICS_ENDPOINT, blob)
    if (ok) return
  }

  fetch(METRICS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true
  }).catch(() => {})
}

const reportWebVital = (name, value) => {
  if (!name || typeof value !== 'number' || Number.isNaN(value)) return
  enqueue({
    type: 'web_vital',
    name,
    value,
    unit: name === 'CLS' ? 'score' : 'ms'
  })
}

const reportApiMetric = ({ endpoint, method, status, durationMs }) => {
  if (!endpoint || typeof durationMs !== 'number' || Number.isNaN(durationMs)) return
  enqueue({
    type: 'api',
    name: 'http',
    endpoint: normalizePath(endpoint),
    method: (method || 'GET').toUpperCase(),
    status: status ? String(status) : 'unknown',
    value: durationMs,
    unit: 'ms'
  })
}

const reportRouteMetric = ({ from, to, durationMs }) => {
  if (!to || typeof durationMs !== 'number' || Number.isNaN(durationMs)) return
  enqueue({
    type: 'route',
    name: 'navigation',
    from: normalizePath(from || ''),
    to: normalizePath(to),
    value: durationMs,
    unit: 'ms'
  })
}

const initWebVitals = () => {
  if (!('PerformanceObserver' in window)) return

  // FCP
  try {
    const paintObserver = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          reportWebVital('FCP', entry.startTime)
        }
      }
    })
    paintObserver.observe({ type: 'paint', buffered: true })
  } catch {}

  // LCP
  let lcpEntry
  try {
    const lcpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries()
      if (entries.length) {
        lcpEntry = entries[entries.length - 1]
      }
    })
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
  } catch {}

  // CLS
  let clsValue = 0
  try {
    const clsObserver = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      }
    })
    clsObserver.observe({ type: 'layout-shift', buffered: true })
  } catch {}

  // INP (approximate)
  let inpValue = 0
  try {
    const inpObserver = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.interactionId && entry.duration) {
          inpValue = Math.max(inpValue, entry.duration)
        }
      }
    })
    inpObserver.observe({ type: 'event', buffered: true, durationThreshold: 40 })
  } catch {}

  const reportFinalVitals = () => {
    if (lcpEntry) {
      reportWebVital('LCP', lcpEntry.startTime)
    }
    if (clsValue > 0) {
      reportWebVital('CLS', clsValue)
    }
    if (inpValue > 0) {
      reportWebVital('INP', inpValue)
    }
    flush()
  }

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      reportFinalVitals()
    }
  })
  window.addEventListener('pagehide', reportFinalVitals)
}

const initFrontendMetrics = () => {
  if (initialized) return
  initialized = true

  initWebVitals()
  setInterval(flush, FLUSH_INTERVAL_MS)
}

export { initFrontendMetrics, reportApiMetric, reportRouteMetric, reportWebVital, flush }
