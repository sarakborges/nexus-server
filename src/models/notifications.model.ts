import { ObjectId } from 'mongodb';

import { Notifications } from '@/enums/notifications.enum';

export type NotificationsModel = {
  _id: ObjectId;
  from: ObjectId;
  to: ObjectId;
  type: Notifications;
  at: Date;
};
