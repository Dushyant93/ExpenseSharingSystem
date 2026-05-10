// Response Factory - Factory Design Pattern
//
// PATTERN: Factory
// WHAT IT DOES: Creates consistent API response objects without the controller
// needing to know the exact structure of the response.
//
// WHY WE USE IT: Without this, every controller builds its own response format.
// Some might return { message: 'ok', data: ... }, others just return the object directly.
// With a factory, every response looks the same across the whole API.
//
// OOP PRINCIPLE: Encapsulation - the response creation logic is hidden inside
// the factory. Controllers just say "give me a success response" and the factory
// handles the structure.
//
// OOP PRINCIPLE: Abstraction - controllers don't know how responses are built,
// they just call createSuccess() or createError()

class ResponseFactory {
  // Creates a successful API response
  static createSuccess(data, message = 'Success', statusCode = 200) {
    return {
      statusCode,
      body: {
        success: true,
        message,
        data,
      },
    };
  }

  // Creates an error API response
  static createError(message = 'Something went wrong', statusCode = 500) {
    return {
      statusCode,
      body: {
        success: false,
        message,
        data: null,
      },
    };
  }

  // Creates a not found response
  static createNotFound(resource = 'Resource') {
    return {
      statusCode: 404,
      body: {
        success: false,
        message: `${resource} not found`,
        data: null,
      },
    };
  }

  // Sends the response using Express res object
  static send(res, response) {
    return res.status(response.statusCode).json(response.body);
  }
}

module.exports = ResponseFactory;
