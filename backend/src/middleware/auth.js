// Placeholder for JWT auth middleware; wire in as needed
export function requireAuth(req, res, next) {
  // TODO: verify JWT in Authorization header
  return next();
}
