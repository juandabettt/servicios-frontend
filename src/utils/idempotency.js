export const generateIdempotencyKey = () =>
  `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
