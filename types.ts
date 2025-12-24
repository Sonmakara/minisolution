
export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export enum IssueCategory {
  HARDWARE = 'HARDWARE',
  SOFTWARE = 'SOFTWARE',
  NETWORK = 'NETWORK',
  SECURITY = 'SECURITY',
  OTHER = 'OTHER'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED'
}

export type AppRole = 'GUEST' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Added for mock credential check
  role: 'USER' | 'ADMIN' | 'TECHNICIAN';
  status: UserStatus;
}

export interface Comment {
  id: string;
  ticketId: string;
  author: string;
  text: string;
  createdAt: string;
  isAi?: boolean;
}

export interface Review {
  id: string;
  resourceName: string; // Equivalent to the requested "Movie name" in the IT context
  userName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'PENDING' | 'APPROVED';
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: TicketStatus;
  createdAt: string;
  userId: string;
  comments?: Comment[];
}

export interface Guide {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: IssueCategory;
  tags: string[];
}

export interface DiagnosisResult {
  steps: string[];
  possibleCauses: string[];
  estimatedDifficulty: 'Easy' | 'Medium' | 'Hard';
}
