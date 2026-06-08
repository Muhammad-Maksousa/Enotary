const { Prisma } = require("@prisma/client");
const CustomError = require('../errors/custom-errors');

const apiHandler = (controller) => {
  return async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (e) {
      console.log('Prisma Error:', e);

      // Custom application errors
      if (e instanceof CustomError) {
        return next(e);
      }

      // Prisma known database errors
      if (e instanceof Prisma.PrismaClientKnownRequestError) {

        // Unique constraint
        if (e.code === 'P2002') {
          return next({
            message: `Duplicate value for field: ${e.meta.target}`,
            statusCode: 422,
          });
        }

        // Foreign key constraint
        if (e.code === 'P2003') {
          return next({
            message: `Foreign key constraint failed on field: ${e.meta.field_name}`,
            statusCode: 422,
          });
        }

        // Record not found
        if (e.code === 'P2025') {
          return next({
            message: 'Record not found',
            statusCode: 404,
          });
        }

        return next({
          message: e.message,
          statusCode: 400,
        });
      }

      // Prisma validation errors
      if (e instanceof Prisma.PrismaClientValidationError) {
        return next({
          message: 'Validation error',
          details: e.message,
          statusCode: 422,
        });
      }

      // Database connection/init errors
      if (e instanceof Prisma.PrismaClientInitializationError) {
        return next({
          message: 'Database connection failed',
          statusCode: 500,
        });
      }

      // Unknown error
      return next({
        message: e.message || 'Internal Server Error',
        statusCode: 500,
      });
    }
  };
};

module.exports = apiHandler;