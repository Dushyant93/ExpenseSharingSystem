// Validate Request Middleware - Middleware (Chain of Responsibility) Pattern
//
// PATTERN: Middleware / Chain of Responsibility
// WHAT IT DOES: Validates that required fields are present in the request body
// BEFORE the request reaches the controller. If fields are missing, it stops
// the chain and returns a 400 error immediately.
//
// WHY WE USE IT: Without this, every controller would need to check if required
// fields are present. With middleware validation, controllers can assume the data
// is valid when they run. The chain is: Auth → Validate → Controller
//
// HOW TO USE:
// router.post('/', auth, validate(['amount', 'description', 'groupId']), createExpense)

const validate = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = requiredFields.filter((field) => {
      const value = req.body[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    // All fields present — pass to next in chain
    next();
  };
};

module.exports = validate;
