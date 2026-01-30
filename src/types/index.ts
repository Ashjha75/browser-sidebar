export type IdeaStatus = 'Planning' | 'In_Progress' | 'Completed';

export interface Idea {
  $id: string;
  title: string;
  description: string;
  status: IdeaStatus;
  tags: string[];
  userId: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface User {
  $id: string;
  email: string;
  name: string;
  $createdAt: string;
}
