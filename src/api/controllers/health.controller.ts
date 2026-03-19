import { Request, Response } from 'express'
import { singleton } from 'tsyringe'

import { HttpStatus } from '@/api/shared/http-status'

/**
 * Health check controller.
 * Provides endpoints to verify the application is running correctly.
 */
@singleton()
export default class HealthController {
  public check(_req: Request, res: Response): Response {
    return res.status(HttpStatus.OK).json({ status: 'ok' })
  }
}
