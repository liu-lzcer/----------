import Alpine from 'alpinejs';
import './styles.css';
import { apiFetch, buildApiUrl, getApiConfig } from './api/client';
import type { User, Project, Task, Version, Comment, Sets } from './types';

function safeToString(value: unknown): string {
  return value == null ? '' : String(value);
}

function appState() {
  return {
    // 全局状态
    configError: '' as string,
    view: 'login' as 'login' | 'app',
    loading: false,
    error: '',
    user: null as User | null,

    // 登录
    credentials: { username: '', password: '' },

    // sets 配置
    sets: { stages: [], statuses: [] } as Sets,

    // 项目与任务
    projects: [] as Project[],
    projectQuery: '',
    selectedProjectId: null as number | null,

    tasks: [] as Task[],
    filters: { q: '', stage: '', status: '' },
    selectedTask: null as Task | null,
    versions: [] as Version[],
    comments: [] as Comment[],
    newComment: '',

    // 搜索
    searchOpen: false,
    searchQuery: '',
    searchResults: [] as Array<{ title: string; items: Array<{ id: string | number; label: string; subtitle?: string; type: string }> }>,

    async init() {
      // 校验环境配置
      try {
        getApiConfig();
      } catch (e) {
        this.configError = (e as Error).message;
        return;
      }

      try {
        await Promise.all([this.loadMe(), this.loadSets()]);
        if (this.user) {
          this.view = 'app';
          await this.loadProjects();
        }
      } catch (e) {
        // 静默处理未登录
      }
    },

    // 会话
    async loadMe() {
      const me = await apiFetch<User>('/me');
      this.user = me;
    },

    async login() {
      this.loading = true; this.error = '';
      try {
        await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(this.credentials) });
        await this.loadMe();
        if (this.user) {
          this.view = 'app';
          await this.loadProjects();
        }
      } catch (e) {
        this.error = safeToString((e as Error).message) || '登录失败';
      } finally { this.loading = false; }
    },

    async logout() {
      try { await apiFetch('/auth/logout', { method: 'POST' }); } catch {}
      this.user = null; this.view = 'login';
    },

    // sets
    async loadSets() {
      try {
        this.sets = await apiFetch<Sets>('/sets');
      } catch {}
    },

    // 项目
    async loadProjects() {
      if (!this.user) return;
      try {
        this.projects = await apiFetch<Project[]>('/projects', {}, { q: this.projectQuery });
      } catch (e) {
        this.projects = [];
      }
    },
    async selectProject(projectId: number) {
      this.selectedProjectId = projectId;
      this.selectedTask = null; this.versions = []; this.comments = [];
      await this.loadTasks();
    },

    // 任务
    async loadTasks() {
      if (!this.selectedProjectId) { this.tasks = []; return; }
      const query = { q: this.filters.q, stage: this.filters.stage, status: this.filters.status };
      try {
        this.tasks = await apiFetch<Task[]>(`/projects/${this.selectedProjectId}/tasks`, {}, query);
      } catch (e) { this.tasks = []; }
    },
    async selectTask(taskId: number) {
      try {
        this.selectedTask = await apiFetch<Task>(`/tasks/${taskId}`);
      } catch { this.selectedTask = null; }
      await this.loadVersions();
      await this.loadComments();
    },
    async loadVersions() {
      if (!this.selectedTask) { this.versions = []; return; }
      try { this.versions = await apiFetch<Version[]>(`/tasks/${this.selectedTask.id}/versions`); } catch { this.versions = []; }
    },
    async loadComments() {
      if (!this.selectedTask) { this.comments = []; return; }
      try { this.comments = await apiFetch<Comment[]>(`/tasks/${this.selectedTask.id}/comments`); } catch { this.comments = []; }
    },
    async submitComment() {
      if (!this.selectedTask || !this.newComment.trim()) return;
      const content = this.newComment.trim();
      try {
        await apiFetch(`/tasks/${this.selectedTask.id}/comments`, { method: 'POST', body: JSON.stringify({ content }) });
        this.newComment = '';
        await this.loadComments();
      } catch {}
    },

    // 下载
    downloadVersion(v: Version) {
      if (!this.selectedTask) return;
      const url = buildApiUrl(`/tasks/${this.selectedTask.id}/versions/${v.versionNo}/download`);
      window.open(url, '_blank');
    },

    // 搜索
    openSearch() { this.searchOpen = true; this.searchQuery = ''; this.searchResults = []; },
    async doSearch() {
      const q = this.searchQuery.trim();
      if (!q) { this.searchResults = []; return; }
      try {
        const res = await apiFetch<Array<{ group: string; id: number | string; label: string; subtitle?: string; type: string }>>('/search', {}, { q });
        const grouped: Record<string, any[]> = {};
        for (const item of res) {
          grouped[item.group] = grouped[item.group] || [];
          grouped[item.group].push(item);
        }
        this.searchResults = Object.entries(grouped).map(([title, items]) => ({ title, items }));
      } catch { this.searchResults = []; }
    },
    navigateSearchResult(item: { type: string; id: number | string }) {
      this.searchOpen = false;
      if (item.type === 'project') {
        const id = Number(item.id);
        if (Number.isFinite(id)) this.selectProject(id);
      } else if (item.type === 'task') {
        const id = Number(item.id);
        if (Number.isFinite(id)) this.selectTask(id);
      }
    },

    // UI
    get latestVersionSummary() {
      if (!this.versions?.length) return '—';
      const v = this.versions[this.versions.length - 1];
      return `v${v.versionNo} · ${(new Date(v.createdAt)).toLocaleString()}`;
    },
    statusBadgeClass(status: string) {
      switch (status) {
        case '完成': return 'bg-green-50 text-green-700 border-green-200';
        case '进行中': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
        case '待开始': return 'bg-gray-50 text-gray-700 border-gray-200';
        case '审核中': return 'bg-blue-50 text-blue-700 border-blue-200';
        default: return 'bg-gray-50 text-gray-700 border-gray-200';
      }
    },
  };
}

(window as any).appState = appState;
(window as any).Alpine = Alpine;
Alpine.start();


