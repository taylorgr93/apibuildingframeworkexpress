const ObjectId = require("mongodb").ObjectId;

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

/**
 * Safely creates a MongoDB ObjectId from a string, returning null if invalid.
 *
 * @param {string} id - The string to convert to ObjectId
 * @returns {ObjectId|null} Valid ObjectId or null
 */
const safeObjectId = (id) => {
  if (typeof id === "string" && OBJECT_ID_REGEX.test(id)) {
    return ObjectId(id);
  }
  if (id instanceof ObjectId) {
    return id;
  }
  return null;
};

/**
 * Creates a MongoDB ObjectId from a string, throwing a descriptive error if invalid.
 *
 * @param {string} id - The string to convert to ObjectId
 * @returns {ObjectId} Valid ObjectId
 * @throws {Error} If the id format is invalid
 */
const requireObjectId = (id) => {
  const oid = safeObjectId(id);
  if (oid === null) {
    throw new Error(`Invalid ObjectId format: ${id}`);
  }
  return oid;
};

/**
 * Escapes special regex characters in a string to prevent ReDoS attacks.
 *
 * @param {string} str - The user input string to escape
 * @returns {string} Escaped string safe for use in $regex
 */
const escapeRegex = (str) => {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Sanitizes an error object before sending it to the client.
 * Preserves all enumerable properties for backwards compatibility,
 * but strips stack traces and internal file paths.
 *
 * @param {*} err - The raw error
 * @returns {Object} Safe error object without stack traces or internal paths
 */
const sanitizeError = (err) => {
  if (err === null || err === undefined) return {};
  if (typeof err === "string") return { message: err };
  if (typeof err !== "object") return {};

  const SENSITIVE_KEYS = ["stack", "path", "syscall", "hostname", "connectionString"];

  if (err instanceof Error) {
    const safe = { message: err.message };
    for (const key of Object.keys(err)) {
      if (!SENSITIVE_KEYS.includes(key)) {
        safe[key] = err[key];
      }
    }
    return safe;
  }

  const safe = {};
  for (const key of Object.keys(err)) {
    if (!SENSITIVE_KEYS.includes(key)) {
      safe[key] = err[key];
    }
  }
  return Object.keys(safe).length > 0 ? safe : {};
};

module.exports = { safeObjectId, requireObjectId, escapeRegex, sanitizeError, OBJECT_ID_REGEX };
