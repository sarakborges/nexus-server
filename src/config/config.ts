import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  atlasUri: string;
  jwtSecret: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  atlasUri: process.env.ATLAS_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
};

export default config;
