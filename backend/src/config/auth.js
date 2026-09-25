const crypto = require("crypto");

// For local/demo development, a temporary secret is generated when JWT_SECRET
// is intentionally omitted from .env. Set JWT_SECRET in production/shared deployments.
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");

if (!process.env.JWT_SECRET) {
  console.warn("JWT_SECRET not set; using a temporary local development secret. Tokens will reset when the server restarts.");
}

module.exports = { JWT_SECRET };
