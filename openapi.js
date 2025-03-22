import { politicalAffiliationEnum } from "./helpers/constants.js";

const type = (type, options) => ({ type, ...options });

const emailType = type("string", {
  format: "email",
  pattern: "^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,4}$",
  description: "Valid email address format",
});

const uuidType = type("string", {
  format: "uuid",
  pattern:
    "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
  description: "Valid UUID format (e.g., 550e8400-e29b-41d4-a716-446655440000)",
});

const enumType = (enumArray) =>
  type("string", {
    enum: enumArray,
  });

const roleEnum = enumType(["ADMIN", "COMPANY", "AGITATOR"]);
const userStatusEnum = enumType(["VERIFIED", "UNVERIFIED"]);
const politicalAffiliationSchemaEnum = enumType(
  Object.keys(politicalAffiliationEnum)
);

const messageSchema = {
  schema: {
    type: "object",
    properties: {
      message: type("string"),
      statusCode: type("number"),
      status: type("string"),
    },
  },
  example: {
    message: "User 4b068064-116d-4f5c-8380-6d2bb07d5f06 not found",
    statusCode: 404,
    status: "NOT_FOUND",
  },
};

const errorResponsePattern = (statusCode, description, schema) => ({
  [statusCode]: {
    description,
    content: {
      "application/json": schema,
    },
  },
});

const notFoundResponse = errorResponsePattern(404, "NOT_FOUND", messageSchema);

const unauthorizedResponse = errorResponsePattern(
  401,
  "ACCESS_DENY",
  messageSchema
);

const unexpectedErrorResponse = errorResponsePattern(
  500,
  "UNEXPECTED",
  messageSchema
);

const baseErrorResponses = {
  ...unauthorizedResponse,
  ...unexpectedErrorResponse,
};

const userSchema = {
  schema: {
    type: "object",
    properties: {
      userId: uuidType,
      firstName: type("string"),
      lastName: type("string"),
      email: emailType,
      role: roleEnum,
      status: userStatusEnum,
      politicalAffiliation: politicalAffiliationSchemaEnum,
    },
  },
  example: {
    userId: "550e8400-e29b-41d4-a716-446655440000",
    firstName: "Jane",
    lastName: "Doe",
    email: "jane.doe@example.com",
    role: "ADMIN",
    status: "VERIFIED",
    politicalAffiliation: "INDEPENDENT_OR_ENTERPRICE",
  },
};

const tokenPairSchema = {
  schema: {
    type: "object",
    properties: {
      accessToken: type("string"),
      refreshToken: type("string"),
    },
  },
  example: {
    accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI...",
    refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI...",
  },
};

const loginPath = {
  post: {
    tags: ["User Authentication"],
    summary: "User login",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              email: emailType,
              password: type("string"),
            },
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": tokenPairSchema,
        },
      },
      ...baseErrorResponses,
      ...notFoundResponse,
    },
  },
};

const registerPath = {
  post: {
    tags: ["User Authentication"],
    summary: "Register a new user",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              firstName: type("string"),
              lastName: type("string"),
              email: emailType,
              role: roleEnum,
              politicalAffiliation: politicalAffiliationSchemaEnum,
              password: type("string"),
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: "User created",
        content: {
          "application/json": tokenPairSchema,
        },
      },
      ...unexpectedErrorResponse,
    },
  },
};

const confirmRegistrationPath = {
  post: {
    tags: ["User Authentication"],
    summary: "Confirm user registration",
    description:
      "Confirms the user's registration by verifying the code and updating the user status to 'VERIFIED'.",
    security: [
      {
        bearerAuth: [],
      },
    ],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              code: type("string", {
                description: "Verification code sent to the user's email.",
              }),
            },
            required: ["code"],
          },
        },
      },
    },
    responses: {
      200: {
        description:
          "Registration confirmed successfully. Access and refresh tokens are returned.",
        content: {
          "application/json": tokenPairSchema,
        },
      },
      ...baseErrorResponses,
      ...notFoundResponse,
    },
  },
};

const mePath = {
  get: {
    tags: ["User Authentication"],
    summary: "Get user data by token",
    description:
      "Retrieves the authenticated user's data based on the user ID extracted from a valid Bearer token. The endpoint queries the database for a user matching the provided user ID and returns their details in a formatted response.",
    security: [
      {
        bearerAuth: [],
      },
    ],
    responses: {
      200: {
        description:
          "User data retrieved successfully. Returns the user's details in JSON format.",
        content: {
          "application/json": userSchema,
        },
      },
      ...baseErrorResponses,
      ...notFoundResponse,
    },
  },
};

export default {
  openapi: "3.0.0",
  info: {
    title: "User API",
    version: "1.0.0",
    description: "API for user registration and authentication",
  },
  servers: [
    {
      url: "https://knockai-be-latest.onrender.com",
    },
    {
      url: "http://localhost:3000",
    },
  ],
  tags: [
    {
      name: "User Authentication",
      description:
        "Endpoints related to user registration, login, and authentication",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Use a Bearer token for authentication",
      },
    },
  },
  paths: {
    "/api/auth/register": registerPath,
    "/api/auth/login": loginPath,
    "/api/auth/confirmRegistration": confirmRegistrationPath,
    "/api/auth/me": mePath,
  },
};
