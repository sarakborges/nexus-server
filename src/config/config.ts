import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  atlasUri: string;
}

console.log(process.env.PORT);
console.log(process.env.NODE_ENV);
console.log(process.env.ATLAS_URI);

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  atlasUri: process.env.ATLAS_URI || '',
};

export default config;
