/**
 * 资源加载服务
 *
 * 统一管理主题资源的加载，屏蔽本地/远程差异。
 * 当前阶段（第一阶段）使用本地配置；后续可通过切换 source 为 'remote'
 * 自动从服务端拉取配置并缓存，调用方无需改动。
 */
import Taro from '@tarojs/taro';
import { LOCAL_THEME_POOL } from '../config/theme-config';
import type { ThemeResource, ThemeConfigResponse } from '@zuji/shared-types';

// 缓存键
const CACHE_KEY = 'theme_config_cache';
// 缓存有效期（1 天），单位毫秒
const CACHE_TTL = 24 * 60 * 60 * 1000;

// 资源来源：local=本地配置，remote=远程下发
type ResourceSource = 'local' | 'remote';

class ResourceService {
  private themes: ThemeResource[] = [];
  private loaded = false;
  // 当前资源来源，默认 local，后续可切换为 remote
  private source: ResourceSource = 'local';

  /**
   * 加载主题配置
   * 优先读缓存，缓存失效或无缓存时从 source 拉取
   */
  async loadThemes(): Promise<ThemeResource[]> {
    if (this.loaded && this.themes.length > 0) {
      return this.themes;
    }

    if (this.source === 'local') {
      this.themes = LOCAL_THEME_POOL;
      this.loaded = true;
      return this.themes;
    }

    // 第二阶段：从远程拉取配置
    const cached = this.readCache();
    if (cached) {
      this.themes = cached.themes;
      this.loaded = true;
      return this.themes;
    }

    try {
      const remote = await this.fetchRemoteConfig();
      this.writeCache(remote);
      this.themes = remote.themes;
      this.loaded = true;
      return this.themes;
    } catch (e) {
      // 远程拉取失败，降级到本地配置
      console.error('远程主题配置拉取失败，降级到本地:', e);
      this.themes = LOCAL_THEME_POOL;
      this.loaded = true;
      return this.themes;
    }
  }

  /**
   * 根据名称哈希稳定选取主题
   * 同一地点每次显示同一主题，避免闪烁
   */
  getThemeByName(name: string): ThemeResource {
    const pool = this.loaded ? this.themes : LOCAL_THEME_POOL;
    const idx = this.hashString(name) % pool.length;
    return pool[idx];
  }

  /**
   * 根据 ID 精确获取主题（预留：用户可指定 themeId）
   */
  getThemeById(themeId: string): ThemeResource | undefined {
    return this.themes.find((t) => t.id === themeId);
  }

  /**
   * 切换资源来源（供后续远程配置上线时使用）
   */
  setSource(source: ResourceSource) {
    this.source = source;
    this.loaded = false;
    this.themes = [];
  }

  /**
   * 清除缓存（供调试或配置更新时使用）
   */
  clearCache() {
    Taro.removeStorageSync(CACHE_KEY);
    this.loaded = false;
    this.themes = [];
  }

  // ---- 内部方法 ----

  /** 字符串哈希（简单 DJB2 变体） */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
  }

  /** 读取本地缓存，过期返回 null */
  private readCache(): ThemeConfigResponse | null {
    try {
      const raw = Taro.getStorageSync(CACHE_KEY);
      if (!raw) return null;
      const data: ThemeConfigResponse = JSON.parse(raw);
      // 检查是否过期
      if (Date.now() - new Date(data.updatedAt).getTime() > CACHE_TTL) {
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }

  /** 写入本地缓存 */
  private writeCache(config: ThemeConfigResponse) {
    try {
      Taro.setStorageSync(CACHE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('主题配置缓存写入失败:', e);
    }
  }

  /**
   * 从远程拉取配置（第二阶段实现）
   * 当前为占位，返回空数组触发降级
   */
  private async fetchRemoteConfig(): Promise<ThemeConfigResponse> {
    // TODO: 第二阶段实现
    // const res = await request<ThemeConfigResponse>({ url: '/config/themes', method: 'GET', needAuth: false });
    // return res;
    throw new Error('远程配置尚未实现');
  }
}

// 导出单例，全局共享
export const resourceService = new ResourceService();
