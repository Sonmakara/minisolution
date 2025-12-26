
import { Ticket, TicketStatus, IssueCategory, Guide, Comment, User, UserStatus, Review, Notification, NotificationType } from "../types";

const TICKETS_KEY = 'mini_solution_tickets';
const GUIDES_KEY = 'mini_solution_guides';
const USERS_KEY = 'mini_solution_users';
const REVIEWS_KEY = 'mini_solution_reviews';
const AUTH_KEY = 'mini_solution_auth_user';
const NOTIFICATIONS_KEY = 'mini_solution_notifications';

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
    tags: ['internet', 'wifi', 'slow'],
    status: 'APPROVED',
    authorName: 'System Admin',
    createdAt: new Date('2023-10-01').toISOString()
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
    tags: ['windows', 'crash', 'os'],
    status: 'APPROVED',
    authorName: 'IT Specialist',
    createdAt: new Date('2023-10-05').toISOString()
  }
];

const initialUsers: User[] = [
  { id: 'admin-id-0', name: 'Super Admin', email: 'admin', password: 'administrator', role: 'ADMIN', status: UserStatus.ACTIVE },
  { id: 'admin-001', name: 'System Administrator', email: 'admin@admin.com', password: 'admin', role: 'ADMIN', status: UserStatus.ACTIVE },
  { id: '1', name: 'John Doe', email: 'john.doe@enterprise.com', password: 'password', role: 'USER', status: UserStatus.ACTIVE },
  { id: '2', name: 'Sarah Tech', email: 'sarah.t@enterprise.com', password: 'password', role: 'TECHNICIAN', status: UserStatus.ACTIVE },
  { id: '3', name: 'Admin Root', email: 'makara@admin.com', password: 'admin@123', role: 'ADMIN', status: UserStatus.ACTIVE },
  { id: '4', name: 'Mike Ross', email: 'mike.r@enterprise.com', password: 'password', role: 'USER', status: UserStatus.DISABLED },
];

const initialReviews: Review[] = [
  { id: 'r1', resourceName: 'Slow Wi-Fi Guide', userName: 'John Doe', rating: 5, comment: 'Fixed my connection instantly! Great guide.', date: '2023-10-20', status: 'APPROVED' },
  { id: 'r2', resourceName: 'BSOD Troubleshooting', userName: 'Mike Ross', rating: 2, comment: 'Steps were a bit confusing for non-techies.', date: '2023-11-05', status: 'PENDING' },
  { id: 'r3', resourceName: 'Network Security Policy', userName: 'Sarah Tech', rating: 4, comment: 'Very comprehensive, though could use more examples.', date: '2023-11-12', status: 'PENDING' },
];

export const mockApi = {
  // Notifications
  getNotifications: (): Notification[] => {
    const user = mockApi.getCurrentUser();
    if (!user) return [];
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    const allNotifications: Notification[] = data ? JSON.parse(data) : [];
    return allNotifications.filter(n => n.userId === user.id);
  },

  createNotification: (userId: string, title: string, message: string, type: NotificationType, link?: string) => {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    const allNotifications: Notification[] = data ? JSON.parse(data) : [];
    const newNotification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
      link
    };
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([newNotification, ...allNotifications]));
    window.dispatchEvent(new Event('notifications_updated'));
  },

  markNotificationAsRead: (id: string) => {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    const allNotifications: Notification[] = data ? JSON.parse(data) : [];
    const updated = allNotifications.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('notifications_updated'));
  },

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
    
    const users = mockApi.getUsers();
    users.filter(u => u.role === 'ADMIN').forEach(admin => {
      mockApi.createNotification(
        admin.id, 
        'New Ticket Assigned', 
        `User ${ticket.userId} created a new ticket: ${ticket.title}`, 
        NotificationType.TICKET, 
        'tickets'
      );
    });

    return newTicket;
  },

  updateTicketStatus: (id: string, status: TicketStatus) => {
    const tickets = mockApi.getTickets();
    let ticketOwnerId = '';
    const updated = tickets.map(t => {
      if (t.id === id) {
        ticketOwnerId = t.userId;
        return { ...t, status };
      }
      return t;
    });
    localStorage.setItem(TICKETS_KEY, JSON.stringify(updated));
    
    if (ticketOwnerId) {
      mockApi.createNotification(
        ticketOwnerId,
        'Ticket Status Updated',
        `Your ticket #${id} status has been changed to ${status}.`,
        NotificationType.TICKET,
        'tickets'
      );
    }
  },

  addComment: (ticketId: string, comment: Omit<Comment, 'id' | 'createdAt' | 'ticketId'>) => {
    const tickets = mockApi.getTickets();
    let ticketOwnerId = '';
    let ticketTitle = '';
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        ticketOwnerId = t.userId;
        ticketTitle = t.title;
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

    const currentUser = mockApi.getCurrentUser();
    if (ticketOwnerId && currentUser && currentUser.id !== ticketOwnerId) {
      mockApi.createNotification(
        ticketOwnerId,
        'New Ticket Comment',
        `${comment.author} replied to your ticket: ${ticketTitle}`,
        NotificationType.TICKET,
        'tickets'
      );
    }
  },

  getGuides: (): Guide[] => {
    const data = localStorage.getItem(GUIDES_KEY);
    return data ? JSON.parse(data) : initialGuides;
  },

  createGuide: (guide: Omit<Guide, 'id' | 'createdAt'>): Guide => {
    const guides = mockApi.getGuides();
    const newGuide: Guide = {
      ...guide,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(GUIDES_KEY, JSON.stringify([...guides, newGuide]));

    // Notify admins of pending knowledge submission
    if (newGuide.status === 'PENDING') {
      const users = mockApi.getUsers();
      users.filter(u => u.role === 'ADMIN').forEach(admin => {
        mockApi.createNotification(
          admin.id,
          'Knowledge Submission',
          `${newGuide.authorName} submitted a new guide: ${newGuide.title}`,
          NotificationType.KNOWLEDGE,
          'knowledge'
        );
      });
    }

    return newGuide;
  },

  updateGuide: (id: string, updates: Partial<Guide>) => {
    const guides = mockApi.getGuides();
    const updated = guides.map(g => g.id === id ? { ...g, ...updates } : g);
    localStorage.setItem(GUIDES_KEY, JSON.stringify(updated));
  },

  approveGuide: (id: string) => {
    const guides = mockApi.getGuides();
    let authorName = '';
    let guideTitle = '';
    const updated = guides.map(g => {
      if (g.id === id) {
        authorName = g.authorName;
        guideTitle = g.title;
        return { ...g, status: 'APPROVED' as const };
      }
      return g;
    });
    localStorage.setItem(GUIDES_KEY, JSON.stringify(updated));

    // Notify author if they are a registered user
    const users = mockApi.getUsers();
    const author = users.find(u => u.name === authorName);
    if (author) {
      mockApi.createNotification(
        author.id,
        'Knowledge Approved',
        `Your guide "${guideTitle}" is now live!`,
        NotificationType.KNOWLEDGE,
        'knowledge'
      );
    }
  },

  deleteGuide: (id: string) => {
    const guides = mockApi.getGuides();
    const filtered = guides.filter(g => g.id !== id);
    localStorage.setItem(GUIDES_KEY, JSON.stringify(filtered));
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
    let reviewOwnerName = '';
    const updated = reviews.map(r => {
      if (r.id === reviewId) {
        reviewOwnerName = r.userName;
        return { ...r, status };
      }
      return r;
    });
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));

    const allUsers = mockApi.getUsers();
    const userToNotify = allUsers.find(u => u.name === reviewOwnerName);
    if (userToNotify) {
      mockApi.createNotification(
        userToNotify.id,
        'Review Approved',
        `Your review for ${updated.find(r => r.id === reviewId)?.resourceName} has been approved!`,
        NotificationType.REVIEW,
        'reviews'
      );
    }
  },

  deleteReview: (reviewId: string) => {
    const reviews = mockApi.getReviews();
    const updated = reviews.filter(r => r.id !== reviewId);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
  },

  login: (email: string, password?: string): User | null => {
    const users = mockApi.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
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
  },

  triggerSystemHealthAlert: () => {
    const users = mockApi.getUsers();
    const admins = users.filter(u => u.role === 'ADMIN');
    admins.forEach(admin => {
      mockApi.createNotification(
        admin.id,
        'System Health Warning',
        'An increase in database latency has been detected in the production cluster.',
        NotificationType.SYSTEM,
        'dashboard'
      );
    });
  }
};
