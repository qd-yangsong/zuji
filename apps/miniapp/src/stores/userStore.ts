/**
 * 全局用户状态管理
 *
 * 使用 Taro Storage + 简单事件订阅替代 zustand，
 * 避免 useSyncExternalStore 在 Taro reconciler 中的兼容性问题。
 */
import Taro from '@tarojs/taro';
import { useState, useEffect, useCallback } from 'react';
import type { UserDto } from '@zuji/shared-types';

const STORAGE_KEY = 'zuji_user';

// 全局状态
let currentUser: UserDto | null = null;

// 初始化时从 Storage 读取
try {
  const raw = Taro.getStorageSync(STORAGE_KEY);
  if (raw) {
    currentUser = typeof raw === 'string' ? JSON.parse(raw) : raw;
  }
} catch {
  // ignore
}

// 简单的发布订阅
type Listener = (user: UserDto | null) => void;
const listeners = new Set<Listener>();

function notify(user: UserDto | null) {
  listeners.forEach((fn) => fn(user));
}

/** 设置用户（同时持久化到 Storage） */
export function setUser(user: UserDto | null) {
  currentUser = user;
  if (user) {
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(user));
  } else {
    Taro.removeStorageSync(STORAGE_KEY);
  }
  notify(user);
}

/** 获取当前用户（非响应式） */
export function getUser(): UserDto | null {
  return currentUser;
}

/**
 * 响应式获取用户状态（React Hook）
 * 替代 zustand 的 useUserStore
 */
export function useUserStore() {
  const [user, setUserState] = useState<UserDto | null>(currentUser);

  useEffect(() => {
    const listener: Listener = (u) => setUserState(u);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const update = useCallback((u: UserDto | null) => {
    setUser(u);
  }, []);

  return { user, setUser: update };
}
