import { create } from 'zustand';
import type { UserDto } from '@zuji/shared-types';

interface UserState {
  user: UserDto | null;
  setUser: (u: UserDto | null) => void;
}

// 全局用户状态管理
export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
