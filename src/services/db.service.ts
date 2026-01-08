
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  
  // Simulate saving data to a specific user's "table"
  saveUserData(userId: string, key: string, data: any) {
    try {
      const storageKey = `db_${userId}_${key}`;
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {
      console.error('Database write error', e);
    }
  }

  // Simulate reading data
  getUserData<T>(userId: string, key: string, defaultValue: T): T {
    try {
      const storageKey = `db_${userId}_${key}`;
      const data = localStorage.getItem(storageKey);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error('Database read error', e);
      return defaultValue;
    }
  }

  clearUserSession(userId: string) {
    // Optional: Clear session specific data if needed
  }
}
