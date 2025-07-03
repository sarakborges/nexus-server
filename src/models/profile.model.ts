import { ObjectId } from 'mongodb';

export type ProfileModel = {
  _id: ObjectId;
  userId: ObjectId;
  name: string;
  picture: string;
  uri: string;
  bio?: string;
  links?: Array<{
    label: string;
    uri: string;
  }>;
};
