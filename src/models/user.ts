import { ObjectId } from 'mongodb';

export type User = {
  id: ObjectId;
  email: string;
  password: string;
  profiles?: Array<ObjectId>;
  activeProfile?: ObjectId;
};
