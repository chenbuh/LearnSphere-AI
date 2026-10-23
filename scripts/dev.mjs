// 一条命令同时启动前台（5173）和管理后台（5174）dev server
// 任一进程退出或按 Ctrl+C 时，另一个一并关闭
// 使用 --strictPort：端口被占用时直接报错，避免前台顺延占掉后台的 5174 导致跳转失败
import { spawn, spawnSync } from 'node:child_process'

const apps = [
  { name: 'frontend', color: '\x1b[36m', workspace: 'frontend-vue' },
  { name: 'admin', color: '\x1b[35m', workspace: 'learnsphere-admin' }
]

const children = []
let stopping = false

const stopAll = (code = 0) => {
  if (stopping) return
  stopping = true
  for (const child of children) {
    if (child.exitCode !== null) continue
    // Windows 下 shell 启动的是进程树，需要整棵结束
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
    } else {
      child.kill('SIGTERM')
    }
  }
  process.exit(code)
}

const pipeWithPrefix = (stream, target, prefix) => {
  let buffer = ''
  stream.on('data', (chunk) => {
    buffer += chunk.toString()
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop()
    for (const line of lines) target.write(`${prefix} ${line}\n`)
  })
  stream.on('end', () => {
    if (buffer) target.write(`${prefix} ${buffer}\n`)
  })
}

for (const app of apps) {
  const prefix = `${app.color}[${app.name}]\x1b[0m`
  const child = spawn('npm', ['run', 'dev', '--workspace', app.workspace, '--', '--strictPort'], {
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1' }
  })
  pipeWithPrefix(child.stdout, process.stdout, prefix)
  pipeWithPrefix(child.stderr, process.stderr, prefix)
  child.on('exit', (code) => {
    if (stopping) return
    console.error(`${prefix} 已退出 (code ${code})，关闭其余 dev server。若提示端口被占用，请先关掉之前单独启动的 dev server`)
    stopAll(code ?? 1)
  })
  children.push(child)
}

process.on('SIGINT', () => stopAll(0))
process.on('SIGTERM', () => stopAll(0))
