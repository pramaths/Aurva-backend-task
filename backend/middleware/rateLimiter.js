const rateLimit = require('express-rate-limit');


const createRateLimiter = (options = {}) => {
    return rateLimit({
      windowMs: options.windowMs || 15 * 60 * 1000, // default 15 minutes
      max: options.max || 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests, please try again later',
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
      handler: (req, res, next, options) => {
        logger.warn('Rate limit exceeded', {
          ip: req.ip,
          path: req.path
        });
        res.status(options.statusCode).send(options.message);
      }
    });
  };
  
  module.exports = createRateLimiter;
  