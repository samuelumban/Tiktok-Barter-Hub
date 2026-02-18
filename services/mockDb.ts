import { User, Song, Task, UserRole, UserTier, SongStatus, TaskStatus, SongGenre, CapcutStatus, ContentCategory } from '../types';

// Initial Seed Data
const MOCK_USERS: User[] = [
  {
    id: 'admin',
    userCode: 'A-0000',
    username: 'mimin.samuel',
    password: 'lombardo',
    name: 'Samuel Admin',
    email: 'admin@barterhub.id',
    phoneNumber: '081234567890',
    role: UserRole.ADMIN,
    credits: 999,
    lastActivity: new Date().toISOString(),
    lastTaskSubmission: new Date().toISOString(),
    isActive: true,
    tier: UserTier.TOP_TIER,
    penaltyPointsWeek: 0,
    hasSeenOnboarding: true
  }
];

const MOCK_SONGS: Song[] = [];

const MOCK_TASKS: Task[] = [];

// LocalStorage Keys
const KEYS = {
  USERS: 'tbh_users',
  SONGS: 'tbh_songs',
  TASKS: 'tbh_tasks',
  CURRENT_USER: 'tbh_current_user'
};

class MockDB {
  private users: User[];
  private songs: Song[];
  private tasks: Task[];

  constructor() {
    this.users = this.load(KEYS.USERS, MOCK_USERS);
    this.songs = this.load(KEYS.SONGS, MOCK_SONGS);
    this.tasks = this.load(KEYS.TASKS, MOCK_TASKS);
  }

  private load<T>(key: string, defaultData: T): T {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultData;
  }

  private save(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private persist() {
    this.save(KEYS.USERS, this.users);
    this.save(KEYS.SONGS, this.songs);
    this.save(KEYS.TASKS, this.tasks);
  }

  // --- Auth ---
  login(username: string, password?: string): User | null {
    const user = this.users.find(u => u.username === username);
    if (!user) return null;

    if (user.password && user.password !== password) {
        return null; 
    }

    const now = new Date();
    
    // PENALTY LOGIC
    // Reset penalty week counter if it's a new week (simplification: based on lastPenaltyDate > 7 days)
    if (user.lastPenaltyDate) {
        const lastPenalty = new Date(user.lastPenaltyDate).getTime();
        if ((now.getTime() - lastPenalty) > 7 * 24 * 60 * 60 * 1000) {
            user.penaltyPointsWeek = 0;
        }
    }

    // Check inactivity for penalty
    if (user.lastTaskSubmission && user.role !== UserRole.ADMIN) {
        const lastSub = new Date(user.lastTaskSubmission).getTime();
        const diffHours = (now.getTime() - lastSub) / (1000 * 60 * 60);
        
        // If inactive > 24 hours AND haven't reached max penalty (10)
        if (diffHours > 24 && user.penaltyPointsWeek < 10) {
            // Apply 5 point penalty
            const pointsToDeduct = 5;
            // Ensure we don't deduct more than allowed weekly limit remaining
            const allowedDeduction = Math.min(pointsToDeduct, 10 - user.penaltyPointsWeek);
            
            if (allowedDeduction > 0) {
                user.credits = Math.max(0, user.credits - allowedDeduction);
                user.penaltyPointsWeek += allowedDeduction;
                user.lastPenaltyDate = now.toISOString();
            }
        }
    }


    // Inactivity Check (Status)
    const lastActive = new Date(user.lastActivity).getTime();
    const hoursSinceActive = (now.getTime() - lastActive) / (1000 * 60 * 60);

    if (hoursSinceActive > 48) {
      this.songs.forEach(s => {
        if (s.ownerId === user.id) s.status = SongStatus.INACTIVE;
      });
      user.isActive = false; 
    } else {
      user.isActive = true;
      this.songs.forEach(s => {
         if (s.ownerId === user.id && s.status === SongStatus.INACTIVE) {
            const unlockTime = new Date(s.unlockDate).getTime();
            if (now.getTime() > unlockTime) s.status = SongStatus.ACTIVE;
            else s.status = SongStatus.LOCKED;
         }
      });
    }

    user.lastActivity = now.toISOString();
    this.persist();
    return user;
  }

  registerUser(data: { name: string; username: string; password: string; phoneNumber: string; email: string }): User {
    if (this.users.some(u => u.username === data.username)) {
        throw new Error("Username sudah digunakan");
    }

    const creators = this.users.filter(u => u.role === UserRole.CREATOR);
    const nextNum = creators.length + 1;
    const userCode = `U-${String(nextNum).padStart(4, '0')}`;

    const newUser: User = {
        id: `u_${Date.now()}`,
        userCode: userCode,
        username: data.username,
        password: data.password,
        name: data.name,
        phoneNumber: data.phoneNumber,
        email: data.email,
        role: UserRole.CREATOR,
        credits: 5,
        lastActivity: new Date().toISOString(),
        lastTaskSubmission: new Date().toISOString(), 
        isActive: true,
        tier: UserTier.BRONZE,
        penaltyPointsWeek: 0,
        hasSeenOnboarding: false // New users need onboarding
    };

    this.users.push(newUser);
    this.persist();
    return newUser;
  }

  updateUserProfile(userId: string, data: { tiktokUsername: string; tiktokLink: string; category: ContentCategory }): User {
      const user = this.getUser(userId);
      if (!user) throw new Error("User not found");
      
      user.tiktokUsername = data.tiktokUsername;
      user.tiktokLink = data.tiktokLink;
      user.contentCategory = data.category;
      
      this.persist();
      return user;
  }
  
  completeOnboarding(userId: string) {
      const user = this.getUser(userId);
      if (user) {
          user.hasSeenOnboarding = true;
          this.persist();
      }
  }

  resetPassword(username: string, phoneNumber: string, newPassword: string): boolean {
    const user = this.users.find(u => u.username === username);
    if (!user) {
        throw new Error("Username tidak ditemukan.");
    }
    const cleanInputPhone = phoneNumber.replace(/\D/g, '');
    const cleanUserPhone = (user.phoneNumber || '').replace(/\D/g, '');

    if (cleanInputPhone !== cleanUserPhone) {
        throw new Error("Nomor HP tidak cocok dengan data pengguna.");
    }

    user.password = newPassword;
    this.persist();
    return true;
  }

  getUser(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  updateUser(id: string, updates: Partial<User>): User {
    const user = this.users.find(u => u.id === id);
    if (!user) throw new Error("User tidak ditemukan");

    if (updates.username && updates.username !== user.username) {
        if (this.users.some(u => u.username === updates.username)) {
            throw new Error("Username sudah digunakan user lain.");
        }
    }

    Object.assign(user, updates);
    this.persist();
    return user;
  }

  // --- Songs ---
  getSongsByUser(userId: string): Song[] {
    return this.songs.filter(s => s.ownerId === userId);
  }

  getAllSongs(): Song[] {
    return this.songs;
  }

  addSong(userId: string, title: string, artist: string, url: string, genre: SongGenre, capcutUrl?: string): Song {
    const user = this.getUser(userId);
    if (!user) throw new Error("User tidak ditemukan");

    const userSongs = this.getSongsByUser(userId);
    const index = userSongs.length + 1;
    const now = new Date();
    const unlockDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); 

    const newSong: Song = {
      id: `s_${Date.now()}`,
      rowCode: `${user.userCode}-S0${index}`,
      ownerId: userId,
      title,
      artist,
      tiktokAudioUrl: url,
      status: SongStatus.ACTIVE,
      submittedAt: now.toISOString(),
      unlockDate: unlockDate.toISOString(),
      usageCount: 0,
      genre: genre,
      capcutTemplateUrl: capcutUrl,
      capcutStatus: capcutUrl ? CapcutStatus.COMPLETED : CapcutStatus.NONE
    };

    this.songs.push(newSong);
    this.persist();
    return newSong;
  }

  deleteSong(songId: string): void {
    this.songs = this.songs.filter(s => s.id !== songId);
    this.persist();
  }

  // --- CapCut Features ---
  requestCapcutTemplate(userId: string, songId: string) {
      const user = this.getUser(userId);
      const song = this.songs.find(s => s.id === songId);
      if (!user || !song) throw new Error("Data invalid");

      if (user.credits < 500) throw new Error("Kredit tidak mencukupi (Min 500)");
      
      song.capcutStatus = CapcutStatus.REQUESTED;
      this.persist();
  }

  fulfillCapcutRequest(songId: string, templateLink: string) {
      const song = this.songs.find(s => s.id === songId);
      if (!song) throw new Error("Song not found");
      
      song.capcutTemplateUrl = templateLink;
      song.capcutStatus = CapcutStatus.COMPLETED;
      this.persist();
  }

  // --- Tasks ---
  getTasksByAssignee(userId: string): Task[] {
    return this.tasks.filter(t => t.assigneeId === userId);
  }

  getPendingApprovals(ownerId: string): Task[] {
    const ownerSongIds = this.songs.filter(s => s.ownerId === ownerId).map(s => s.id);
    return this.tasks.filter(t => ownerSongIds.includes(t.songId) && t.status === TaskStatus.SUBMITTED);
  }

  getApprovedTasks(): Task[] {
      return this.tasks.filter(t => t.status === TaskStatus.APPROVED);
  }

  assignRandomTask(userId: string): Task | null {
    const today = new Date().toDateString();
    const userTasks = this.getTasksByAssignee(userId);
    const tasksToday = userTasks.filter(t => new Date(t.createdAt).toDateString() === today);

    if (tasksToday.length >= 5) {
        throw new Error("Batas harian tercapai (Maks 5 sound/hari).");
    }

    let eligibleSongs = this.songs.filter(
      s => s.ownerId !== userId && s.status === SongStatus.ACTIVE
    );

    const songsAssignedToday = tasksToday.map(t => t.songId);
    eligibleSongs = eligibleSongs.filter(s => !songsAssignedToday.includes(s.id));

    if (eligibleSongs.length === 0) return null;

    const randomSong = eligibleSongs[Math.floor(Math.random() * eligibleSongs.length)];

    const newTask: Task = {
      id: `t_${Date.now()}`,
      taskCode: `T-${Math.floor(Math.random() * 10000)}`,
      assigneeId: userId,
      songId: randomSong.id,
      status: TaskStatus.PENDING,
      createdAt: new Date().toISOString()
    };

    this.tasks.push(newTask);
    this.persist();
    return newTask;
  }

  submitTask(taskId: string, link: string): void {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = TaskStatus.SUBMITTED;
      task.contentLink = link;
      task.submittedAt = new Date().toISOString();
      
      const user = this.getUser(task.assigneeId);
      if (user) {
          user.lastTaskSubmission = new Date().toISOString();
      }

      this.persist();
    }
  }

  reviewTask(taskId: string, approved: boolean, feedback?: string, rating?: number): void {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    if (approved) {
      task.status = TaskStatus.APPROVED;
      task.completedAt = new Date().toISOString();
      task.rating = rating || 5;
      
      // Credit Logic: +10 Points per success content
      const assignee = this.users.find(u => u.id === task.assigneeId);
      if (assignee) {
        assignee.credits += 10;
        
        // Tier Update
        if (assignee.credits >= 1000) assignee.tier = UserTier.TOP_TIER;
        else if (assignee.credits >= 500) assignee.tier = UserTier.GOLD;
        else if (assignee.credits >= 200) assignee.tier = UserTier.SILVER;
      }

      const song = this.songs.find(s => s.id === task.songId);
      if (song) song.usageCount += 1;

    } else {
      task.status = TaskStatus.REJECTED;
      task.feedback = feedback || 'Mohon direvisi.';
    }
    this.persist();
  }

  // --- Stats ---
  getStats(userId: string) {
    const user = this.getUser(userId);
    if (!user) return null;

    const mySongs = this.getSongsByUser(userId);
    const myApprovedTasks = this.tasks.filter(t => t.assigneeId === userId && t.status === TaskStatus.APPROVED).length;
    
    // Obligation: 1 song submitted = 1 task required.
    const obligation = mySongs.length; 
    const debt = Math.max(0, obligation - myApprovedTasks);

    return {
      credits: user.credits,
      debt,
      activeSongs: mySongs.filter(s => s.status !== SongStatus.INACTIVE).length,
      pendingReviews: this.getPendingApprovals(userId).length,
      tier: user.tier
    };
  }

  // --- Admin ---
  getAllUsers() { return this.users; }
  getAllTasks() { return this.tasks; }

  addUser(username: string): User {
      if (this.users.some(u => u.username === username)) {
          throw new Error("Username sudah digunakan");
      }
      
      const creators = this.users.filter(u => u.role === UserRole.CREATOR);
      const nextNum = creators.length + 1;
      const userCode = `U-${String(nextNum).padStart(4, '0')}`;
      
      const newUser: User = {
          id: `u_${Date.now()}`,
          userCode: userCode,
          username: username,
          password: 'password123',
          role: UserRole.CREATOR,
          credits: 5,
          lastActivity: new Date().toISOString(),
          lastTaskSubmission: new Date().toISOString(),
          isActive: true,
          tier: UserTier.BRONZE,
          penaltyPointsWeek: 0,
          hasSeenOnboarding: true // Admin created, assume active/trained
      };
      
      this.users.push(newUser);
      this.persist();
      return newUser;
  }
}

export const db = new MockDB();