
import { Ticket, TicketStatus, IssueCategory, Guide, Comment, User, UserStatus, Review } from "../types";

const TICKETS_KEY = 'mini_solution_tickets';
const GUIDES_KEY = 'mini_solution_guides';
const USERS_KEY = 'mini_solution_users';
const REVIEWS_KEY = 'mini_solution_reviews';
const AUTH_KEY = 'mini_solution_auth_user';

const initialGuides: Guide[] = [
  {
    id: '1',
    title: 'Slow Wi-Fi Connection',
    excerpt: 'Simple steps to improve your wireless network speed.',
    content: `
# Troubleshooting Slow Wi-Fi

Wireless network issues are common in modern offices. Follow these steps to diagnose and fix the problem.

## 1. Physical Environment
Check for physical obstructions between the router and the device. Thick walls, refrigerators, and metal cabinets can significantly degrade signal strength.
    `,
    category: IssueCategory.NETWORK,
    tags: ['internet', 'wifi', 'slow']
  },
  {
    id: '2',
    title: 'Blue Screen of Death (BSOD)',
    excerpt: 'What to do when your Windows system crashes unexpectedly.',
    content: `
# Handling BSOD

A Blue Screen of Death (BSOD) usually indicates a critical system error that Windows cannot recover from.
    `,
    category: IssueCategory.SOFTWARE,
    tags: ['windows', 'crash', 'os']
  }
];

const initialUsers: User[] = [
  { id: 'admin-id-0', name: 'Super Admin', email: 'admin', password: 'administrator', role: 'ADMIN', status: UserStatus.ACTIVE },
  { id: 'admin-001', name: 'System Administrator', email: 'admin@admin.com', password: 'admin', role: 'ADMIN', status: UserStatus.ACTIVE },
  { id: '1', name: 'John Doe', email: 'john.doe@enterprise.com', password: 'password', role: 'USER', status: UserStatus.ACTIVE },
  { id: '2', name: 'Sarah Tech', email: 'sarah.t@enterprise.com', password: 'password', role: 'TECHNICIAN', status: UserStatus.ACTIVE },
  { id: '3', name: 'Admin Root', email: 'makara@enterprise.com', password: 'admin@123', role: 'ADMIN', status: UserStatus.ACTIVE },
  { id: '4', name: 'Mike Ross', email: 'mike.r@enterprise.com', password: 'password', role: 'USER', status: UserStatus.DISABLED },
];

const initialReviews: Review[] = [
  { id: 'r1', resourceName: 'Slow Wi-Fi Guide', userName: 'John Doe', rating: 5, comment: 'Fixed my connection instantly! Great guide.', date: '2023-10-20', status: 'APPROVED' },
  { id: 'r2', resourceName: 'BSOD Troubleshooting', userName: 'Mike Ross', rating: 2, comment: 'Steps were a bit confusing for non-techies.', date: '2023-11-05', status: 'PENDING' },
  { id: 'r3', resourceName: 'Network Security Policy', userName: 'Sarah Tech', rating: 4, comment: 'Very comprehensive, though could use more examples.', date: '2023-11-12', status: 'PENDING' },
];

export const mockApi = {
  getTickets: (): Ticket[] => {
    const data = localStorage.getItem(TICKETS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  createTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'status'>): Ticket => {
    const tickets = mockApi.getTickets();
    const newTicket: Ticket = {
      ...ticket,
      id: Math.random().toString(36).substr(2, 5).toUpperCase(),
      createdAt: new Date().toISOString(),
      status: TicketStatus.OPEN,
      comments: []
    };
    localStorage.setItem(TICKETS_KEY, JSON.stringify([...tickets, newTicket]));
    return newTicket;
  },

  updateTicketStatus: (id: string, status: TicketStatus) => {
    const tickets = mockApi.getTickets();
    const updated = tickets.map(t => t.id === id ? { ...t, status } : t);
    localStorage.setItem(TICKETS_KEY, JSON.stringify(updated));
  },

  addComment: (ticketId: string, comment: Omit<Comment, 'id' | 'createdAt' | 'ticketId'>) => {
    const tickets = mockApi.getTickets();
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        const newComment: Comment = {
          ...comment,
          id: Date.now().toString(),
          ticketId,
          createdAt: new Date().toISOString()
        };
        return { ...t, comments: [...(t.comments || []), newComment] };
      }
      return t;
    });
    localStorage.setItem(TICKETS_KEY, JSON.stringify(updated));
  },

  getGuides: (): Guide[] => {
    const data = localStorage.getItem(GUIDES_KEY);
    return data ? JSON.parse(data) : initialGuides;
  },

  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) {
        localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
        return initialUsers;
    }
    return JSON.parse(data);
  },

  updateUser: (userId: string, updates: Partial<User>) => {
    const users = mockApi.getUsers();
    const updated = users.map(u => u.id === userId ? { ...u, ...updates } : u);
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
  },

  getReviews: (): Review[] => {
    const data = localStorage.getItem(REVIEWS_KEY);
    return data ? JSON.parse(data) : initialReviews;
  },

  updateReviewStatus: (reviewId: string, status: 'APPROVED') => {
    const reviews = mockApi.getReviews();
    const updated = reviews.map(r => r.id === reviewId ? { ...r, status } : r);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
  },

  deleteReview: (reviewId: string) => {
    const reviews = mockApi.getReviews();
    const updated = reviews.filter(r => r.id !== reviewId);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
  },

  // Auth Methods
  login: (email: string, password?: string): User | null => {
    const users = mockApi.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // Verify user exists, is active, and if a password was provided, check it matches
    if (user && user.status === UserStatus.ACTIVE) {
      if (password && user.password && user.password !== password) {
        return null;
      }
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  },

  register: (name: string, email: string, password?: string): User => {
    const users = mockApi.getUsers();
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      password,
      role: 'USER',
      status: UserStatus.ACTIVE
    };
    const updated = [...users, newUser];
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
    localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
    return newUser;
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
  }
};
