import swaggerJSDoc from 'swagger-jsdoc'
import { inject, singleton } from 'tsyringe'

import EnvConfig from '@/main/config/env.config'

/**
 * Swagger/OpenAPI configuration.
 *
 * Generates documentation from JSDoc @swagger annotations on route handlers.
 * Only available at /docs in development mode.
 *
 * TODO: Update the API title, version, and description below.
 */
@singleton()
export default class SwaggerConfig {
  public readonly swaggerDocument: swaggerJSDoc.OAS3Definition

  constructor(@inject(EnvConfig) private readonly envConfig: EnvConfig) {
    this.swaggerDocument = swaggerJSDoc(this.getOptions()) as swaggerJSDoc.OAS3Definition
  }

  private getOptions(): swaggerJSDoc.OAS3Options {
    return {
      definition: {
        openapi: '3.0.0',
        info: {
          // TODO: Update title, version, and description for your project
          title: 'REST Boilerplate API',
          version: '1.0.0',
          description: 'REST API boilerplate with Clean Architecture and TypeScript'
        },
        servers: [
          {
            url: `http://localhost:${this.envConfig.env.PORT}`,
            description: 'Development server'
          }
        ],
        components: {
          schemas: {
            Error: {
              type: 'object',
              properties: {
                message: { type: 'string', description: 'Error message' },
                code: { type: 'string', description: 'Semantic error code' }
              },
              required: ['message', 'code'],
              example: {
                message: 'Example not found',
                code: 'NOT_FOUND'
              }
            }
          }
        }
      },
      apis: ['./src/**/*.ts']
    }
  }
}
