import "express";

declare global {
  namespace Express {
    interface Request {
      user?: string;
      role?: number;
    }
  }
}
