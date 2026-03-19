import { Request, Response } from 'express'
import { inject, singleton } from 'tsyringe'

import { createAuditContext } from '@/api/middlewares/audit.middleware'
import {
  CreateExampleBody,
  createExampleBodySchema,
  exampleUuidv7Schema,
  listExamplesQuerySchema,
  UpdateExampleBody,
  updateExampleBodySchema
} from '@/api/schemas/example.schemas'
import { HttpStatus } from '@/api/shared/http-status'

import { BasePayload } from '@/core/providers/messaging/messaging.provider.interfaces'
import CreateExampleUseCase from '@/core/use-cases/example/create/create-example.use-case'
import GetExampleByIdUseCase from '@/core/use-cases/example/get-by-id/get-example-by-id.use-case'
import ListExamplesUseCase from '@/core/use-cases/example/list/list-examples.use-case'

// TODO: Add more use cases as you implement them (update, delete, etc.)

/**
 * Example CRUD controller.
 *
 * Replace "Example" with your domain entity name and update the use cases accordingly.
 * Follow the same pattern: parse input → build audit context → call use case → return response.
 */
@singleton()
export default class ExampleController {
  constructor(
    @inject(CreateExampleUseCase) private readonly createExampleUseCase: CreateExampleUseCase,
    @inject(ListExamplesUseCase) private readonly listExamplesUseCase: ListExamplesUseCase,
    @inject(GetExampleByIdUseCase) private readonly getExampleByIdUseCase: GetExampleByIdUseCase
  ) {}

  /**
   * @swagger
   * /api/v1/examples:
   *   get:
   *     summary: List all examples
   *     tags: [Examples]
   *     parameters:
   *       - in: query
   *         name: active
   *         schema:
   *           type: boolean
   *         description: Filter by active status
   *     responses:
   *       200:
   *         description: List of examples
   */
  public async list(req: Request, res: Response): Promise<Response> {
    const { active } = listExamplesQuerySchema.parse(req.query)

    req.log.info({ active }, 'Listing examples')

    const result = await this.listExamplesUseCase.execute({ active })

    return res.status(HttpStatus.OK).json(result)
  }

  /**
   * @swagger
   * /api/v1/examples/{id}:
   *   get:
   *     summary: Get example by ID
   *     tags: [Examples]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Example UUIDv7
   *     responses:
   *       200:
   *         description: Example found
   *       404:
   *         description: Example not found
   */
  public async getById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params
    const validatedId = exampleUuidv7Schema.parse(id)

    req.log.info({ id: validatedId }, 'Getting example by id')

    const result = await this.getExampleByIdUseCase.execute({ id: validatedId })

    return res.status(HttpStatus.OK).json(result)
  }

  /**
   * @swagger
   * /api/v1/examples:
   *   post:
   *     summary: Create a new example
   *     tags: [Examples]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name]
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *     responses:
   *       201:
   *         description: Example created
   *       400:
   *         description: Invalid input
   */
  public async create(req: Request, res: Response): Promise<Response> {
    const auditContext = createAuditContext(req, 'EXAMPLE_CREATE')
    const body: CreateExampleBody = createExampleBodySchema.parse(req.body)
    const requestData: BasePayload = { ip: req.ip, user: req.requestingUser }

    req.log.info({ name: body.name }, 'Creating example')

    const result = await this.createExampleUseCase.execute(
      { name: body.name, description: body.description, requestData },
      auditContext
    )

    return res.status(HttpStatus.CREATED).json(result)
  }

  // TODO: Add update and delete methods following the same pattern

  private buildUpdateInput(id: string, body: UpdateExampleBody, requestData: BasePayload) {
    return { id, name: body.name, description: body.description, requestData }
  }
}
