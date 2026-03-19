import { trace, SpanStatusCode, Span, context } from '@opentelemetry/api'
import { ATTR_HTTP_REQUEST_METHOD, ATTR_URL_FULL, ATTR_USER_AGENT_ORIGINAL } from '@opentelemetry/semantic-conventions'
import { NextFunction, Request, Response } from 'express'

import EnvConfig from '@/main/config/env.config'

/**
 * OpenTelemetry Trace Middleware
 *
 * Enriches HTTP request spans with custom attributes and captures the force-trace header.
 * Add this middleware early in the Express chain, right after pino-http.
 *
 * Features:
 * - Captures force-trace header for debugging production issues
 * - Adds custom span attributes (user info, request metadata)
 * - Enriches spans with OpenTelemetry semantic conventions
 */

// TODO: Update the tracer name to match your service name
const tracer = trace.getTracer('rest-boilerplate-middleware', '1.0.0')

// Initialize EnvConfig once to avoid creating new instances on every request
const envConfig = new EnvConfig()
const forceTraceHeaderName = envConfig.env.OTEL_FORCE_TRACE_HEADER.toLowerCase()

export function traceMiddleware(req: Request, res: Response, next: NextFunction) {
  const forceTraceHeader = forceTraceHeaderName
  const activeSpan = trace.getActiveSpan()

  if (activeSpan) {
    activeSpan.setAttribute(ATTR_HTTP_REQUEST_METHOD, req.method)
    activeSpan.setAttribute(ATTR_URL_FULL, `${req.protocol}://${req.get('host')}${req.originalUrl}`)
    activeSpan.setAttribute(ATTR_USER_AGENT_ORIGINAL, req.get('user-agent') || 'unknown')
    activeSpan.setAttribute('http.route', req.route?.path || req.path)
    activeSpan.setAttribute('http.request_id', String(req.id) || 'unknown')

    const forceTraceValue = req.get(forceTraceHeader)
    if (forceTraceValue === 'true' || forceTraceValue === '1') {
      activeSpan.setAttribute('app.force_trace', true)
      activeSpan.setAttribute('app.force_trace_header', forceTraceHeader)
    }

    if (req.requestingUser) {
      activeSpan.setAttribute('user.id', req.requestingUser.userId)
      activeSpan.setAttribute('user.role', req.requestingUser.userRole)
    }

    const clientIp = req.ip || req.socket.remoteAddress || 'unknown'
    activeSpan.setAttribute('client.address', clientIp)

    res.on('finish', () => {
      activeSpan.setAttribute('http.response.status_code', res.statusCode)

      if (res.statusCode >= 500) {
        activeSpan.setStatus({ code: SpanStatusCode.ERROR, message: 'Server Error' })
      } else {
        activeSpan.setStatus({ code: SpanStatusCode.OK })
      }
    })
  }

  next()
}

/**
 * Executes a function within a named span context.
 * Use this for manual instrumentation of custom operations.
 *
 * @example
 * await withSpan('my-operation', { 'op.type': 'process' }, async (span) => {
 *   // Your code here — child spans will be properly nested
 * })
 */
export async function withSpan<T>(
  spanName: string,
  attributes: Record<string, string | number | boolean> | undefined,
  fn: (span: Span) => Promise<T>
): Promise<T> {
  const span = tracer.startSpan(spanName, {}, context.active())

  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      span.setAttribute(key, value)
    })
  }

  return context.with(trace.setSpan(context.active(), span), async () => {
    try {
      const result = await fn(span)
      span.setStatus({ code: SpanStatusCode.OK })
      return result
    } catch (error) {
      const err = error as Error
      span.recordException(err)
      span.setStatus({ code: SpanStatusCode.ERROR, message: err.message })
      throw error
    } finally {
      span.end()
    }
  })
}
