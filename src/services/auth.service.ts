
import { Injectable, signal, inject } from '@angular/core';
import { DbService } from './db.service';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Stored locally for this demo
  avatar: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  db = inject(DbService);
  currentUser = signal<User | null>(null);

  constructor() {
    // Check for existing session on load
    const savedUser = localStorage.getItem('aura_session');
    if (savedUser) {
      this.currentUser.set(JSON.parse(savedUser));
    }
  }

  // Register a new user
  register(name: string, email: string, pass: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = this.getUsers();
        if (users.find(u => u.email === email)) {
          resolve(false); // User exists
          return;
        }

        const newUser: User = {
          id: 'u_' + Date.now(),
          name: name,
          email: email,
          password: pass,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&rounded=true`
        };

        users.push(newUser);
        this.saveUsers(users);
        
        // Auto login
        this.createSession(newUser);
        resolve(true);
      }, 600);
    });
  }

  // Login existing user
  login(email: string, pass: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === pass);
        
        if (user) {
          this.createSession(user);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 600);
    });
  }

  // Simulate Google Login
  loginWithGoogle(): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Create a mock Google User
        const googleUser: User = {
          id: 'u_google_' + Date.now(),
          name: 'Usuário Google',
          email: 'usuario@gmail.com',
          avatar: 'https://lh3.googleusercontent.com/a/ACg8ocIq8ddbd2621-6d65454654654=s96-c' // Generic Google Avatar URL or similar
        };
        
        // In a real app, we would check if they exist or create them.
        // Here we just session them immediately.
        this.createSession(googleUser);
        resolve(true);
      }, 1000);
    });
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('aura_session');
  }

  private createSession(user: User) {
    // Don't store password in session
    const { password, ...safeUser } = user;
    this.currentUser.set(safeUser as User);
    localStorage.setItem('aura_session', JSON.stringify(safeUser));
  }

  private getUsers(): User[] {
    const data = localStorage.getItem('aura_users');
    return data ? JSON.parse(data) : [];
  }

  private saveUsers(users: User[]) {
    localStorage.setItem('aura_users', JSON.stringify(users));
  }
}
