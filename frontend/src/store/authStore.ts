import { create } from 'zustand';
import type { User } from '../types';
import api from '../services/api';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    setAuth: (user: User) => void;
    logout: () => Promise<void>;
}

// Load from localStorage for persistence
const storedUser = localStorage.getItem('user');

let initialUser = null;
if (storedUser && storedUser !== 'undefined') {
    try {
        initialUser = JSON.parse(storedUser);
    } catch (e) {
        console.error("Failed to parse user from localStorage", e);
    }
}

export const useAuthStore = create<AuthState>((set) => ({
    user: initialUser,
    isAuthenticated: !!initialUser,
    setAuth: (user) => {
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, isAuthenticated: true });
    },
    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            localStorage.removeItem('user');
            set({ user: null, isAuthenticated: false });
            window.location.href = '/login';
        }
    },
}));
