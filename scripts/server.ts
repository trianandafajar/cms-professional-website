import 'dotenv/config'

import { spawn } from 'child_process'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import path from 'path'

const require = createRequire(import.meta.url)
const nextBin = require.resolve('next/dist/bin/next')
const scriptMode = process.argv[2] === 'start' ? 'start' : 'dev'
const rootDir = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)))
const wsScript = path.join(rootDir, 'scripts', 'websocket-server.ts')

function spawnChild(
  command: string,
  args: string[],
  name: string,
  options?: { fatalOnExit?: boolean },
) {
  const fatalOnExit = options?.fatalOnExit ?? true
  const child = spawn(command, args, {
    cwd: rootDir,
    stdio: 'inherit',
    env: {
      ...process.env,
    },
  })

  child.on('exit', (code, signal) => {
    if (signal) {
      if (fatalOnExit) {
        process.kill(process.pid, signal)
      } else {
        console.warn(`[${name}] exited due to signal ${signal}`)
      }
      return
    }

    if (typeof code === 'number' && code !== 0) {
      if (fatalOnExit) {
        console.error(`[${name}] exited with code ${code}`)
        process.exit(code)
      } else {
        console.warn(
          `[${name}] exited with code ${code}. Next.js will keep running; realtime notifications are temporarily disabled.`,
        )
      }
    }
  })

  return child
}

const wsServer = spawnChild(
  process.execPath,
  ['--import=tsx/esm', wsScript],
  'websocket',
  { fatalOnExit: false },
)

const nextServer = spawnChild(process.execPath, [nextBin, scriptMode], 'next')

let shuttingDown = false

function shutdown() {
  if (shuttingDown) return
  shuttingDown = true
  wsServer.kill('SIGINT')
  nextServer.kill('SIGINT')
}

wsServer.on('exit', (code) => {
  if (shuttingDown) return
  if (typeof code === 'number' && code !== 0) {
    console.warn(
      `[websocket] exited with code ${code}. Next.js will keep running; realtime notifications are temporarily disabled.`,
    )
  }
})

nextServer.on('exit', (code, signal) => {
  if (shuttingDown) return
  shuttingDown = true
  wsServer.kill('SIGINT')
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exit(typeof code === 'number' ? code : 0)
})

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
