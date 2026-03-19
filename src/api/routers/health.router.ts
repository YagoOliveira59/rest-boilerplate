import { Router } from 'express'
import { inject, singleton } from 'tsyringe'

import HealthController from '@/api/controllers/health.controller'

@singleton()
export default class HealthRouter {
  public readonly router: Router

  constructor(@inject(HealthController) private readonly healthController: HealthController) {
    this.router = Router()
    this.setupRoutes()
  }

  private setupRoutes() {
    // GET /api/health - Check application status
    this.router.get('/', (req, res) => this.healthController.check(req, res))
  }
}
