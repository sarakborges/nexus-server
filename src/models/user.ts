import { Profile } from './profile';

export type User = {
  id: number;
  email: string;
  password: string;
  profiles?: Array<Profile>;
  activeProfile?: number;
};
