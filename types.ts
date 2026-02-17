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

export type ContentCategory = 
  'Quotes Motivasi' | 'Quotes Religi' | 'Quotes Rohani' | 'Lipsing' | 
  'Dance' | 'Drama' | 'Vlog' | 'Cooking' | 'Lyrics' | 'Personal' | 'Gosip' | 'Berita';

export interface User {
  id: string;
  userCode: string; // U-0001
  username: string;
  password?: string;
  name?: string;
  phoneNumber?: string;
  email?: string;
  role: UserRole;
  credits: number;
  lastActivity: string; // ISO Date (Login/Navigation)
  lastTaskSubmission?: string; // ISO Date (Content Creation Activity)
  isActive: boolean;
  tier: UserTier;
  
  // New Profile Fields
  tiktokUsername?: string;
  tiktokLink?: string;
  contentCategory?: ContentCategory;

  // Penalty Tracking
  penaltyPointsWeek: number; // Max 10 per week
  lastPenaltyDate?: string;
}

export enum SongStatus {
  LOCKED = 'locked',
  ACTIVE = 'active',
  INACTIVE = 'inactive' // due to user inactivity
}

export type SongGenre = 'Pop' | 'Religi' | 'Dangdut' | 'Remix' | 'Rohani' | 'Jazz' | 'Etnik' | 'Humor' | 'Kids';

export enum CapcutStatus {
  NONE = 'none',
  REQUESTED = 'requested',
  COMPLETED = 'completed'
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
  
  // New Fields
  genre?: SongGenre;
  capcutTemplateUrl?: string; // Optional field for CapCut
  capcutStatus: CapcutStatus;
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
  rating?: number; // 1-5 Stars
}

export interface DashboardStats {
  credits: number;
  debt: number;
  activeSongs: number;
  pendingReviews: number;
}