/**
 * OpenTelemetry Instrumentation Bootstrap
 *
 * CRITICAL: This file MUST be imported FIRST (before any other application code)
 * so that auto-instrumentation can patch libraries correctly.
 *
 * TODO: Update serviceName to match your project name.
 */

import 'reflect-metadata'
import 'dotenv/config'

import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { PrismaInstrumentation } from '@prisma/instrumentation'

import EnvConfig from '@/main/config/env.config'
import { createTelemetrySDK, startTelemetry } from '@/main/config/telemetry.config'

const envConfig = new EnvConfig()
const { env } = envConfig

// eslint-disable-next-line dot-notation
const SERVICE_VERSION = process.env['npm_package_version'] || '1.0.0'

// Telemetry is always disabled in tests to avoid noise
const shouldEnableTelemetry = env.NODE_ENV === 'test' ? false : env.OTEL_ENABLED

// TODO: Update serviceName below
const sdk = createTelemetrySDK({
  serviceName: 'rest-boilerplate',
  serviceVersion: SERVICE_VERSION,
  environment: env.NODE_ENV,
  enableTelemetry: shouldEnableTelemetry,
  traceExporter: env.OTEL_EXPORTER,
  samplingRate: env.OTEL_SAMPLING_RATE,
  forceTraceHeader: env.OTEL_FORCE_TRACE_HEADER,
  gcpProjectId: env.GCP_PROJECT_ID || env.PUBSUB_PROJECT_ID
})

if (sdk && shouldEnableTelemetry) {
  registerInstrumentations({ instrumentations: [new PrismaInstrumentation()] })
}

// eslint-disable-next-line no-void
void startTelemetry(sdk)

export const shutdownHandler = async (signal: string) => {
  if (sdk) {
    // eslint-disable-next-line no-console
    console.log(`[Telemetry] Received ${signal}, shutting down OpenTelemetry SDK...`)
    try {
      await Promise.race([
        sdk.shutdown(),
        new Promise((_resolve, reject) => setTimeout(() => reject(new Error('Telemetry shutdown timeout')), 10000))
      ])
      // eslint-disable-next-line no-console
      console.log('[Telemetry] OpenTelemetry SDK shut down successfully')
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Telemetry] Error during shutdown:', error)
    }
  }
}
