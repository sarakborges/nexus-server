import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '@/config/config.ts';

const { jwtSecret } = config;
const JWT_EXPIRES_IN = '1h';

export const signJwt = (payload: object): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: JWT_EXPIRES_IN },
      (err, token) => {
        if (err || !token) {
          return reject(err);
        }
        resolve(token);
      },
    );
  });
};

export const verifyJwt = (token: string): Promise<string | JwtPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded!);
    });
  });
};
