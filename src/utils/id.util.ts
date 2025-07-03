import { ObjectId } from 'mongodb';

export const toObjectId = (id: string): ObjectId => {
  if (!ObjectId.isValid(id)) {
    throw new Error(`Invalid ObjectId: ${id}`);
  }
  return new ObjectId(id);
};

export const mapToObjectIds = (ids: string[]): ObjectId[] => {
  return ids.map(toObjectId);
};
