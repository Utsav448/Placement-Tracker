// Express doesn't automatically catch errors thrown inside an async route handler.
// If we don't catch them ourselves, an unexpected database error (like a missing
// table) can crash the ENTIRE server process, taking the whole site down for
// every user - not just failing that one request.
//
// This wrapper catches any error from an async route and hands it to Express's
// error-handling middleware (defined in server.js) instead of letting it crash.

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
