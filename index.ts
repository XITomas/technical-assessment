import { readFileSync, writeFileSync } from 'fs';
import * as crypto from 'crypto';

interface UserSession {
  id: string;
  userId: number;
  createdAt: Date;
  expiresAt: Date;
}


// What Programming Language ? 
// - How did you identify it

// What runtime environment does this suggest ?
// - Which APIs or indicators led you to this conclusion

// Would this code work in a browser without modifications ? Why / why not?

// BONUS :

// Identify potential security issues or improvements in this code

// Extra questions for Backend Profile Assessment

// - Did you identify any code smells (unused variable, etc..)

// - What would you do with the secretKey property


class SessionManager {
  private sessions: Map<string, UserSession> = new Map();
  private readonly secretKey: string;

  constructor() {
    this.secretKey = process.env.SESSION_SECRET || 'default-secret';

    if (typeof window !== 'undefined') {
        console.warn('SessionManager should not run in this runtime ❌');
      }
  }

  createSession(userId: number): string {
    const sessionId = crypto.randomUUID();
    const session: UserSession = {
      id: sessionId,
      userId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };

    this.sessions.set(sessionId, session);
    this.persistSession(sessionId, session);
    
    return sessionId;
  }

  private persistSession(id: string, session: UserSession): void {
    try {
      const data = JSON.stringify(session);
      writeFileSync(`./sessions/${id}.json`, data, 'utf8');
    } catch (error) {
      console.error('Failed to persist session:', error);
    }
  }

  validateSession(sessionId: string): UserSession | null {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      try {
        const data = readFileSync(`./sessions/${sessionId}.json`, 'utf8');
        const persistedSession: UserSession = JSON.parse(data);
        this.sessions.set(sessionId, persistedSession);
        return persistedSession;
      } catch {
        return null;
      }
    }

    if (session.expiresAt < new Date()) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session;
  }

  async fetchUserProfile(userId: number): Promise<any> {
    const response = await fetch(`https://api.example.com/users/${userId}`, {
      headers: {
        'User-Agent': 'SessionManager/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}

export default SessionManager;
export { UserSession };