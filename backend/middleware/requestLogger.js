// Request Logger Middleware - Decorator Design Pattern
//
// PATTERN: Decorator
// WHAT IT DOES: Adds logging behaviour to every request without modifying
// any existing controller or route. It wraps the request processing pipeline
// and adds logging before and after.
//
// WHY WE USE IT: We want to log every API request (method, URL, response time)
// for debugging and monitoring. Without Decorator, we'd have to add console.log
// to every single controller function. With Decorator, we add it once as middleware.
//
// PATTERN: Middleware (Chain of Responsibility)
// This file also demonstrates the Middleware pattern — request passes through
// this logger first, then moves to the next function in the chain.
//
// OOP PRINCIPLE: Separation of Concerns - logging logic is completely separate
// from business logic. Controllers don't know they are being logged.

const requestLogger = (req, res, next) => {
  // Record when the request started
  const startTime = Date.now();

  // Log the incoming request
  console.log(`[${new Date().toISOString()}] --> ${req.method} ${req.originalUrl}`);

  // Intercept res.json to log the response (this is the Decorator part)
  // We wrap the original res.json with our own version that logs first
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    const duration = Date.now() - startTime;
    console.log(
      `[${new Date().toISOString()}] <-- ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`
    );
    return originalJson(body);
  };

  // Pass to next middleware in chain
  next();
};

module.exports = requestLogger;
