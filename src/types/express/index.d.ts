import { JwtPayload as DefaultJwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface UserPayload {
      _id: string;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
