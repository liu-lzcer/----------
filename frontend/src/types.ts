export type Role = 'Admin' | 'Director' | 'Producer' | 'Artist';

export interface User {
  id: number;
  username: string;
  nickname?: string;
  role: Role;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  archived?: boolean;
}

export interface Task {
  id: number;
  shotNo: string;
  title: string;
  stage: string;
  status: string;
  assignee?: User | null;
  dueDate?: string | null;
  remark?: string | null;
  updatedAt?: string;
}

export interface Version {
  versionNo: number;
  createdAt: string;
}

export interface Comment {
  id: number;
  author: User;
  content: string;
  createdAt: string;
}

export interface Sets {
  stages: string[];
  statuses: string[];
}


