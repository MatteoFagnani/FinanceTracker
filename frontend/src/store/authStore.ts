import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
}

// Load from localStorage for persistence
const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('token');

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
    token: storedToken || null,
    isAuthenticated: !!storedToken,
    setAuth: (user, token) => {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
    },
    logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
    },
}));
