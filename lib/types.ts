export type Role = 'USER' | 'ADMIN';
export type TaskStatus = 'TODO' | 'DOING' | 'DONE';

export interface SocialLinks {
  github: string;
  linkedin: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  phone: string;
  dateOfBirth: string | null;
  socialLinks: SocialLinks;
  createdAt: string;
  updatedAt: string;
}

// The creator/assignedUser fields on a Task come back from the backend
// via .populate('creator', 'name email') — only these fields are present,
// not the full User document (no role, no timestamps).
export interface UserRef {
  _id: string;
  name: string;
  email: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  creator: UserRef;
  assignedUser: UserRef | null;
  createdAt: string;
  updatedAt: string;
}
