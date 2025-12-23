import { verifyToken, getTokenFromRequest } from './auth';
import { JwtPayload } from '../types';

export interface Context {
  user?: JwtPayload;
}

export const createContext = async ({ req }: { req: { headers: { authorization?: string } } }): Promise<Context> => {
  const token = getTokenFromRequest(req.headers.authorization);
  
  if (!token) {
    return {};
  }

  try {
    const payload = verifyToken(token);
    return { user: payload };
  } catch (error) {
    return {};
  }
};


