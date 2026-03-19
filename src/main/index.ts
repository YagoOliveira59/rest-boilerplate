/**
 * Application Entry Point
 *
 * CRITICAL IMPORT ORDER:
 * 1. instrumentation.ts — must be FIRST to enable OpenTelemetry auto-instrumentation
 * 2. module.ts — loads reflect-metadata and configures the DI container
 * 3. Server — resolves and starts the HTTP server
 */

import '@/main/instrumentation'

// module.ts must be second to ensure 'reflect-metadata' is loaded before DI decorators
import { container } from '@/main/dependencies/module'

// eslint-disable-next-line import-helpers/order-imports
import Server from '@/infra/web/server'

async function main() {
  try {
    const server = container.resolve(Server)
    await server.start()
  } catch (error) {
    // Logger may not be available here — console.error is a safe fallback
    // eslint-disable-next-line no-console
    console.error('Failed to bootstrap the application server', error)
    process.exit(1)
  }
}

main()
