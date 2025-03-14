const type = (type, options) => ({ type, ...options });

const emailType = type("string", {
  format: "email",
  pattern: "^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,4}$",
  description: "Valid email address format",
});

const enumType = (enumArray) =>
  type("string", {
    enum: enumArray,
  });

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
      401: {
        description: "Unauthorized",
      },
    },
  },
};

const registerPath = {
  post: {
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
              role: enumType(["admin", "user", "guest"]),
              politicalAffiliation: enumType(["admin", "user", "guest"]),
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
      400: {
        description: "Bad request",
      },
    },
  },
};

const confirmRegistrationPath = {
  post: {
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
      400: {
        description: "Invalid request or verification code.",
      },
      401: {
        description: "Unauthorized. Invalid or missing token.",
      },
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
  },
};
