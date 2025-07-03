import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  atlasUri: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  dbName: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  atlasUri: process.env.ATLAS_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || '',
  dbName: process.env.DB_NAME || '',
};

export default config;
