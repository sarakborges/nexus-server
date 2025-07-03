import { ObjectId } from 'mongodb';

import { ConnectionsStatus } from '@/enums/connectionsStatus.enum';

export type ConnectionsModel = {
  _id: ObjectId;
  requestedBy: ObjectId;
  between: Array<ObjectId>;
  status: ConnectionsStatus;
  requestedConnectionAt?: Date;
  connectedSince?: Date;
};
