export enum UserTier {
  BRONZE = 'Bronze',
  SILVER = 'Silver', // 10 credits
  GOLD = 'Gold',     // 25 credits
  TOP_TIER = 'Top Tier' // 50 credits
}

export enum UserRole {
  CREATOR = 'creator',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  userCode: string; // U-0001
  username: string;
  role: UserRole;
  credits: number;
  lastActivity: string; // ISO Date
  isActive: boolean;
  tier: UserTier;
}

export enum SongStatus {
  LOCKED = 'locked',
  ACTIVE = 'active',
  INACTIVE = 'inactive' // due to user inactivity
}

export interface Song {
  id: string;
  rowCode: string; // U-0001-S-0001
  ownerId: string;
  title: string;
  artist: string;
  tiktokAudioUrl: string;
  status: SongStatus;
  submittedAt: string; // ISO Date
  unlockDate: string; // ISO Date (H+8)
  usageCount: number;
}

export enum TaskStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface Task {
  id: string;
  taskCode: string; // T-0001
  assigneeId: string; // The creator making the content
  songId: string; // The song they need to use
  status: TaskStatus;
  contentLink?: string;
  createdAt: string;
  submittedAt?: string;
  completedAt?: string;
  feedback?: string;
}

export interface DashboardStats {
  credits: number;
  debt: number;
  activeSongs: number;
  pendingReviews: number;
}