import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminAuthState {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

// Admin credentials (in a real app, this would be verified server-side)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

export const useAdminAuth = create<AdminAuthState>(
  persist(
    (set) => ({
      isAuthenticated: false,
      username: null,
      
      login: (username, password) => {
        // Check credentials
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
          set({
            isAuthenticated: true,
            username,
          });
          return true;
        }
        return false;
      },
      
      logout: () => {
        set({
          isAuthenticated: false,
          username: null,
        });
      },
    }),
    {
      name: 'ahadu-admin-auth',
    }
  )
);
