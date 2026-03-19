import { Router } from 'express'
import { inject, singleton } from 'tsyringe'

import ExampleController from '@/api/controllers/example.controller'
import { checkAuthMiddleware } from '@/api/middlewares/auth.middleware'

// TODO: Replace ExampleRouter and ExampleController with your domain entity name

/**
 * Example entity router.
 *
 * Apply auth middleware to routes that require authentication.
 * Some routes may be public (e.g., GET list/detail), others may need auth (POST/PUT/DELETE).
 */
@singleton()
export default class ExampleRouter {
  public readonly router: Router

  constructor(@inject(ExampleController) private readonly exampleController: ExampleController) {
    this.router = Router()
    this.setupRoutes()
  }

  private setupRoutes() {
    // GET /api/v1/examples - List all examples (public)
    this.router.get('/', (req, res, next) => this.exampleController.list(req, res).catch(next))

    // GET /api/v1/examples/:id - Get example by ID (public)
    this.router.get('/:id', (req, res, next) => this.exampleController.getById(req, res).catch(next))

    // POST /api/v1/examples - Create example (requires auth)
    this.router.post('/', checkAuthMiddleware, (req, res, next) =>
      this.exampleController.create(req, res).catch(next)
    )

    // TODO: Add PUT, PATCH, DELETE routes following the same pattern
  }
}
