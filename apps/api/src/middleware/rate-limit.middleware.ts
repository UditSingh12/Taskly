import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per `window` (here, per 15 minutes)
  message: { error: { message: 'Too many authentication attempts, please try again later.', statusCode: 429 } },
  standardHeaders: true,
  legacyHeaders: false,
});

export const requestAssignmentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per minute
  message: { error: { message: 'Too many assignment requests, please slow down.', statusCode: 429 } },
  standardHeaders: true,
  legacyHeaders: false,
});

export const aiParserLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 requests per hour
  message: { error: { message: 'AI task parsing limit reached for this hour.', statusCode: 429 } },
  standardHeaders: true,
  legacyHeaders: false,
});
