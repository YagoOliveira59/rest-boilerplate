import { MetricExporter } from '@google-cloud/opentelemetry-cloud-monitoring-exporter'
import { TraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter'
import { Context } from '@opentelemetry/api'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks'
import type { Instrumentation } from '@opentelemetry/instrumentation'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { PeriodicExportingMetricReader, ConsoleMetricExporter } from '@opentelemetry/sdk-metrics'
import { NodeSDK } from '@opentelemetry/sdk-node'
import {
  Sampler,
  SamplingDecision,
  SamplingResult,
  ConsoleSpanExporter,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
  BatchSpanProcessor,
  SimpleSpanProcessor
} from '@opentelemetry/sdk-trace-node'
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION, ATTR_HTTP_REQUEST_HEADER } from '@opentelemetry/semantic-conventions'

interface TelemetryConfigOptions {
  serviceName: string
  serviceVersion: string
  environment: string
  enableTelemetry: boolean
  traceExporter: 'gcp' | 'console'
  samplingRate: number
  forceTraceHeader: string
  gcpProjectId: string | undefined
}

/**
 * Custom sampler: checks for force-trace header to bypass sampling rate.
 * Send `x-force-trace: true` to always sample a specific request (useful for debugging).
 */
class HeaderBasedSampler implements Sampler {
  private readonly fallbackSampler: Sampler
  private readonly forceTraceHeader: string

  constructor(samplingRate: number, forceTraceHeader: string) {
    this.fallbackSampler = new TraceIdRatioBasedSampler(samplingRate)
    this.forceTraceHeader = forceTraceHeader.toLowerCase()
  }

  // eslint-disable-next-line max-params
  shouldSample(
    context: Context,
    traceId: string,
    spanName: string,
    spanKind: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    attributes: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    links: any[]
  ): SamplingResult {
    const httpHeaders = attributes[`${ATTR_HTTP_REQUEST_HEADER}.${this.forceTraceHeader}`]
    const forceTrace = Array.isArray(httpHeaders) ? httpHeaders[0] : httpHeaders

    if (forceTrace === 'true' || forceTrace === '1') {
      return {
        decision: SamplingDecision.RECORD_AND_SAMPLED,
        attributes: { 'app.sampling.forced': true, 'app.sampling.reason': 'force_trace_header' }
      }
    }

    return this.fallbackSampler.shouldSample(context, traceId, spanName, spanKind, attributes, links)
  }

  toString(): string {
    return `HeaderBasedSampler{header=${this.forceTraceHeader}}`
  }
}

/**
 * Creates and configures the OpenTelemetry NodeSDK.
 *
 * TODO: Update the service name below to match your project.
 * TODO: Remove GCP exporters if not deploying to Google Cloud.
 */
export function createTelemetrySDK(options: TelemetryConfigOptions): NodeSDK | null {
  if (!options.enableTelemetry) return null

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: options.serviceName,
    [ATTR_SERVICE_VERSION]: options.serviceVersion,
    'deployment.environment': options.environment
  })

  const traceExporter =
    options.traceExporter === 'gcp' && options.gcpProjectId
      ? new TraceExporter({ projectId: options.gcpProjectId })
      : new ConsoleSpanExporter()

  const spanProcessor =
    options.traceExporter === 'console'
      ? new SimpleSpanProcessor(traceExporter)
      : new BatchSpanProcessor(traceExporter, {
          // cspell:disable-next-line
          scheduledDelayMillis: 5000,
          maxQueueSize: 2048,
          maxExportBatchSize: 512,
          // cspell:disable-next-line
          exportTimeoutMillis: 30000
        })

  const sampler = new ParentBasedSampler({
    root: new HeaderBasedSampler(options.samplingRate, options.forceTraceHeader)
  })

  const metricExporter =
    options.traceExporter === 'gcp' && options.gcpProjectId
      ? new MetricExporter({ projectId: options.gcpProjectId })
      : new ConsoleMetricExporter()

  const metricReader = new PeriodicExportingMetricReader({
    exporter: metricExporter,
    // cspell:disable-next-line
    exportIntervalMillis: 60000
  })

  const instrumentations: Instrumentation[] = getNodeAutoInstrumentations({
    '@opentelemetry/instrumentation-express': { enabled: true },
    '@opentelemetry/instrumentation-http': {
      enabled: true,
      ignoreIncomingRequestHook: (request) => (request.url || '').includes('/api/health')
    }
  })

  const contextManager = new AsyncHooksContextManager()
  contextManager.enable()

  const sdk = new NodeSDK({
    autoDetectResources: true,
    resource,
    spanProcessors: [spanProcessor],
    metricReader,
    sampler,
    instrumentations,
    contextManager
  })

  // eslint-disable-next-line no-console
  console.log('[Telemetry] Configuration:', {
    serviceName: options.serviceName,
    exporter: options.traceExporter,
    samplingRate: options.samplingRate
  })

  return sdk
}

export async function startTelemetry(sdk: NodeSDK | null): Promise<void> {
  if (!sdk) return

  try {
    await sdk.start()
    // eslint-disable-next-line no-console
    console.log('OpenTelemetry SDK started successfully')
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start OpenTelemetry SDK', error)
    // Don't throw — telemetry failure should not prevent the app from starting
  }
}
