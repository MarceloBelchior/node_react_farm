import swaggerJSDoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Brain Agriculture API',
    version: '1.0.0',
    description: 'API for Rural Producer Management System - A comprehensive solution for managing agricultural producers and their farms',
    contact: {
      name: 'Brain Agriculture Team',
      email: 'support@brainagriculture.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Development server',
    },
    {
      url: 'https://api.brainagriculture.com',
      description: 'Production server',
    },
  ],
  tags: [
    {
      name: 'Producers',
      description: 'Rural producer management operations',
    },
    {
      name: 'Farms',
      description: 'Farm management operations',
    },
    {
      name: 'Dashboard',
      description: 'Dashboard and statistics operations',
    },
    {
      name: 'Health',
      description: 'System health and monitoring',
    },
  ],
  components: {
    schemas: {
      Producer: {
        type: 'object',
        required: ['name', 'cpfCnpj'],
        properties: {
          id: {
            type: 'string',
            description: 'Unique identifier for the producer',
            example: '683f2c15ef80d24658e93496',
          },
          name: {
            type: 'string',
            description: 'Producer name',
            example: 'João Silva',
            minLength: 2,
            maxLength: 100,
          },
          cpfCnpj: {
            type: 'string',
            description: 'CPF (11 digits) or CNPJ (14 digits)',
            example: '12345678909',
            pattern: '^[0-9]{11}$|^[0-9]{14}$',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Producer email address',
            example: 'joao.silva@email.com',
          },
          phone: {
            type: 'string',
            description: 'Producer phone number',
            example: '(11) 99999-9999',
          },
          address: {
            type: 'string',
            description: 'Producer address',
            example: 'Rua das Flores, 123, Centro, São Paulo, SP',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
          farmCount: {
            type: 'number',
            description: 'Number of farms owned by the producer',
            example: 2,
          },
        },
      },
      Farm: {
        type: 'object',
        required: ['name', 'city', 'state', 'totalArea', 'arableArea', 'vegetationArea', 'crops'],
        properties: {
          id: {
            type: 'string',
            description: 'Unique identifier for the farm',
            example: '683f2c15ef80d24658e93497',
          },
          name: {
            type: 'string',
            description: 'Farm name',
            example: 'Fazenda Santa Clara',
            minLength: 2,
            maxLength: 100,
          },
          city: {
            type: 'string',
            description: 'City where the farm is located',
            example: 'Ribeirão Preto',
            minLength: 2,
            maxLength: 50,
          },
          state: {
            type: 'string',
            description: 'State where the farm is located (2 letters)',
            example: 'SP',
            pattern: '^[A-Z]{2}$',
          },
          totalArea: {
            type: 'number',
            description: 'Total area of the farm in hectares',
            example: 1000.5,
            minimum: 0.1,
          },
          arableArea: {
            type: 'number',
            description: 'Arable area in hectares',
            example: 800.0,
            minimum: 0,
          },
          vegetationArea: {
            type: 'number',
            description: 'Vegetation area in hectares',
            example: 200.5,
            minimum: 0,
          },
          crops: {
            type: 'array',
            description: 'List of crops grown on the farm',
            items: {
              type: 'string',
              enum: ['Soja', 'Milho', 'Algodão', 'Café', 'Cana de Açúcar'],
            },
            example: ['Soja', 'Milho'],
            minItems: 1,
          },
          producerId: {
            type: 'string',
            description: 'ID of the producer who owns this farm',
            example: '683f2c15ef80d24658e93496',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
      },
      CreateProducerRequest: {
        type: 'object',
        required: ['name', 'cpfCnpj'],
        properties: {
          name: {
            type: 'string',
            description: 'Producer name',
            example: 'João Silva',
            minLength: 2,
            maxLength: 100,
          },
          cpfCnpj: {
            type: 'string',
            description: 'CPF (11 digits) or CNPJ (14 digits)',
            example: '12345678909',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Producer email address',
            example: 'joao.silva@email.com',
          },
          phone: {
            type: 'string',
            description: 'Producer phone number',
            example: '(11) 99999-9999',
          },
          address: {
            type: 'string',
            description: 'Producer address',
            example: 'Rua das Flores, 123, Centro, São Paulo, SP',
          },
          farms: {
            type: 'array',
            description: 'Optional list of farms to create with the producer',
            items: {
              $ref: '#/components/schemas/CreateFarmRequest',
            },
          },
        },
      },
      CreateFarmRequest: {
        type: 'object',
        required: ['name', 'city', 'state', 'totalArea', 'arableArea', 'vegetationArea', 'crops'],
        properties: {
          name: {
            type: 'string',
            description: 'Farm name',
            example: 'Fazenda Santa Clara',
            minLength: 2,
            maxLength: 100,
          },
          city: {
            type: 'string',
            description: 'City where the farm is located',
            example: 'Ribeirão Preto',
            minLength: 2,
            maxLength: 50,
          },
          state: {
            type: 'string',
            description: 'State where the farm is located (2 letters)',
            example: 'SP',
            pattern: '^[A-Z]{2}$',
          },
          totalArea: {
            type: 'number',
            description: 'Total area of the farm in hectares',
            example: 1000.5,
            minimum: 0.1,
          },
          arableArea: {
            type: 'number',
            description: 'Arable area in hectares',
            example: 800.0,
            minimum: 0,
          },
          vegetationArea: {
            type: 'number',
            description: 'Vegetation area in hectares',
            example: 200.5,
            minimum: 0,
          },
          crops: {
            type: 'array',
            description: 'List of crops grown on the farm',
            items: {
              type: 'string',
              enum: ['Soja', 'Milho', 'Algodão', 'Café', 'Cana de Açúcar'],
            },
            example: ['Soja', 'Milho'],
            minItems: 1,
          },
        },
      },
      DashboardStats: {
        type: 'object',
        properties: {
          totalFarms: {
            type: 'number',
            description: 'Total number of farms',
            example: 150,
          },
          totalProducers: {
            type: 'number',
            description: 'Total number of producers',
            example: 75,
          },
          totalHectares: {
            type: 'number',
            description: 'Total area in hectares',
            example: 125000.5,
          },
          averageFarmSize: {
            type: 'number',
            description: 'Average farm size in hectares',
            example: 833.34,
          },
          totalCrops: {
            type: 'number',
            description: 'Total number of different crops',
            example: 5,
          },
          farmsByState: {
            type: 'object',
            description: 'Number of farms by state',
            additionalProperties: {
              type: 'number',
            },
            example: {
              SP: 45,
              MG: 30,
              MT: 25,
            },
          },
          farmsByCrop: {
            type: 'object',
            description: 'Number of farms by crop type',
            additionalProperties: {
              type: 'number',
            },
            example: {
              Soja: 85,
              Milho: 65,
              Algodão: 25,
            },
          },
          landUse: {
            type: 'object',
            properties: {
              agricultural: {
                type: 'number',
                description: 'Total agricultural area in hectares',
                example: 95000.0,
              },
              vegetation: {
                type: 'number',
                description: 'Total vegetation area in hectares',
                example: 30000.5,
              },
            },
          },
          topStates: {
            type: 'array',
            description: 'Top states by number of farms',
            items: {
              type: 'object',
              properties: {
                state: {
                  type: 'string',
                  example: 'SP',
                },
                count: {
                  type: 'number',
                  example: 45,
                },
              },
            },
          },
          topCrops: {
            type: 'array',
            description: 'Top crops by number of farms',
            items: {
              type: 'object',
              properties: {
                crop: {
                  type: 'string',
                  example: 'Soja',
                },
                count: {
                  type: 'number',
                  example: 85,
                },
              },
            },
          },
        },
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Indicates if the request was successful',
            example: true,
          },
          data: {
            description: 'Response data',
          },
          message: {
            type: 'string',
            description: 'Response message',
            example: 'Operation completed successfully',
          },
          error: {
            type: 'string',
            description: 'Error message (only present when success is false)',
            example: 'Validation failed',
          },
        },
      },
      ValidationError: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'string',
            example: 'Dados inválidos fornecidos',
          },
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                  example: 'cpfCnpj',
                },
                message: {
                  type: 'string',
                  example: 'CPF/CNPJ inválido',
                },
              },
            },
          },
        },
      },
      PaginationResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Producer',
            },
          },
          pagination: {
            type: 'object',
            properties: {
              page: {
                type: 'number',
                example: 1,
              },
              limit: {
                type: 'number',
                example: 10,
              },
              total: {
                type: 'number',
                example: 25,
              },
              pages: {
                type: 'number',
                example: 3,
              },
            },
          },
        },
      },
    },
    parameters: {
      PageParam: {
        in: 'query',
        name: 'page',
        schema: {
          type: 'integer',
          minimum: 1,
          default: 1,
        },
        description: 'Page number for pagination',
      },
      LimitParam: {
        in: 'query',
        name: 'limit',
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 10,
        },
        description: 'Number of items per page',
      },
      SearchParam: {
        in: 'query',
        name: 'search',
        schema: {
          type: 'string',
        },
        description: 'Search term for filtering results',
      },
      ProducerIdParam: {
        in: 'path',
        name: 'id',
        required: true,
        schema: {
          type: 'string',
          pattern: '^[0-9a-fA-F]{24}$',
        },
        description: 'Producer ID (MongoDB ObjectId)',
      },
      FarmIdParam: {
        in: 'path',
        name: 'id',
        required: true,
        schema: {
          type: 'string',
          pattern: '^[0-9a-fA-F]{24}$',
        },
        description: 'Farm ID (MongoDB ObjectId)',
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // paths to files containing OpenAPI definitions
};

export const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
