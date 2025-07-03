import { ObjectId } from 'mongodb';

export type UserModel = {
  _id: ObjectId;
  email: string;
  password: string;
  activeProfile?: ObjectId;
};
