export interface Profile {
  id: number;
  userId: number;
  name: string;
  picture: string;
  uri: string;
}

export let profiles: Profile[] = [];
