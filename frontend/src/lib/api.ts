import axios from 'axios';

// API base configuration
const API_BASE_URL = 'https://projeto-pw1-redeidosos.onrender.com';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (email: string, senha: string) => 
    api.post('/login', { email, senha }),
  register: (data: RegisterData) => 
    api.post('/api/users/create-user', data),
  logout: () => 
    api.post('/logout'),
};

// Users endpoints
export const usersAPI = {
  getAll: (role?: string) => 
    api.get('/users', { params: { role } }),
  getById: (id: string) => 
    api.get(`/users/${id}`),
  create: (data: CreateUserData) => 
    api.post('/users', data),
  updateRole: (id: string, role: string) => 
    api.put(`/users/${id}/role`, { role }),
  updateStatus: (id: string, ativo: boolean) => 
    api.put(`/users/${id}/status`, { ativo }),
  validate: (id: string) => 
    api.put(`/users/${id}/validate`),
  verify: (id: string) => 
    api.put(`/users/${id}/verify`),
  delete: (id: string) => 
    api.delete(`/users/${id}`),
};

// Elders endpoints
export const eldersAPI = {
  getAll: () => 
    api.get('/elders'),
  getMe: () => 
    api.get('/elders/me'),
  create: (data: ElderData) => 
    api.post('/elders', data),
  updateMe: (data: Partial<ElderData>) => 
    api.put('/elders/me', data),
  updateLocation: (latitude: number, longitude: number) => 
    api.put('/elders/me/location', { latitude, longitude }),
};

// Volunteers endpoints
export const volunteersAPI = {
  getAll: () => 
    api.get('/volunteers'),
  getMe: () => 
    api.get('/volunteers/me'),
  updateMe: (data: Partial<VolunteerData>) => 
    api.put('/volunteers/me', data),
  updateLocation: (latitude: number, longitude: number) => 
    api.put('/volunteers/me/location', { latitude, longitude }),
};

// Companionships (Solicitações) endpoints
export const companionshipsAPI = {
  getAll: () => 
    api.get('/companionships'),
  getById: (id: string) => 
    api.get(`/companionships/${id}`),
  getMine: () => 
    api.get('/companionships/me'),
  getNearby: (lat: number, lng: number) => 
    api.get('/map/companionships/nearby', { params: { lat, lng } }),
  create: (data: CompanionshipData) => 
    api.post('/companionships', data),
  update: (id: string, data: Partial<CompanionshipData>) => 
    api.put(`/companionships/${id}`, data),
  updateStatus: (id: string, status: string) => 
    api.put(`/companionships/${id}/status`, { status }),
  accept: (id: string) => 
    api.post(`/companionships/${id}/accept`),
  complete: (id: string) => 
    api.put(`/companionships/${id}/complete`),
  match: (idosoId: string, voluntarioId: string) => 
    api.post('/companionships/match', { idoso_id: idosoId, voluntario_id: voluntarioId }),
  delete: (id: string) => 
    api.delete(`/companionships/${id}`),
};

// Reviews endpoints
export const reviewsAPI = {
  getAll: () => 
    api.get('/reviews'),
  getMine: () => 
    api.get('/reviews/me'),
  create: (data: ReviewData) => 
    api.post('/reviews', data),
};

// Files/Upload endpoints
export const filesAPI = {
  upload: (file: File, entityType?: string, entityId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (entityType) formData.append('entidade_tipo', entityType);
    if (entityId) formData.append('entidade_id', entityId);
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getById: (id: string) => 
    api.get(`/files/${id}`),
  delete: (id: string) => 
    api.delete(`/files/${id}`),
};

// Verifications endpoints
export const verificationsAPI = {
  getAll: () => 
    api.get('/verifications'),
  approve: (id: string) => 
    api.put(`/verifications/${id}/approve`),
  delete: (id: string) => 
    api.delete(`/verifications/${id}`),
};

// ONGs endpoints
export const ongsAPI = {
  getAll: () => 
    api.get('/ongs'),
  getById: (id: string) => 
    api.get(`/ongs/${id}`),
};

// Map endpoints
export const mapAPI = {
  getCompanionships: () => 
    api.get('/map/companionships'),
  getElders: () => 
    api.get('/map/elders'),
  getVolunteers: () => 
    api.get('/map/volunteers'),
  getNearbyCompanionships: (lat: number, lng: number) => 
    api.get('/map/companionships/nearby', { params: { lat, lng } }),
  getMyCompanionships: () => 
    api.get('/map/companionships/me'),
};

// Reports endpoints
export const reportsAPI = {
  getSummary: (from?: string, to?: string) => 
    api.get('/reports/summary', { params: { from, to } }),
  getStatistics: () => 
    api.get('/reports/statistics'),
  getLocations: () => 
    api.get('/reports/locations'),
  getElders: () => 
    api.get('/reports/elders'),
  getImpact: () => 
    api.get('/reports/impact'),
};

// Types
export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
  papel: 'admin' | 'gestor_publico' | 'ong' | 'voluntario' | 'idoso';
  telefone?: string;
}

export interface CreateUserData {
  nome: string;
  email: string;
  senha: string;
  papel: string;
  telefone?: string;
}

export interface ElderData {
  endereco: string;
  latitude: number;
  longitude: number;
  data_nascimento: string;
  necessidades_especiais?: string;
}

export interface VolunteerData {
  documentos_url?: string;
  disponibilidade?: string;
  latitude?: number;
  longitude?: number;
}

export interface CompanionshipData {
  atividade: string;
  descricao: string;
  data: string;
  hora: string;
  latitude: number;
  longitude: number;
  local_descricao: string;
}

export interface ReviewData {
  destinatario_id: string;
  tipo: 'idoso_para_voluntario' | 'voluntario_para_idoso';
  nota: number;
  comentario?: string;
}

export interface User {
  id: string;
  nome: string;
  email: string;
  papel: 'admin' | 'gestor_publico' | 'ong' | 'voluntario' | 'idoso';
  telefone?: string;
  foto_perfil_url?: string;
  verificado: boolean;
  ativo: boolean;
}

export interface Elder {
  id: string;
  usuario_id: string;
  usuario?: User;
  endereco: string;
  latitude: number;
  longitude: number;
  data_nascimento: string;
  necessidades_especiais?: string;
}

export interface Volunteer {
  id: string;
  usuario_id: string;
  usuario?: User;
  documentos_url?: string;
  disponibilidade?: string;
  latitude?: number;
  longitude?: number;
}

export interface Companionship {
  id: string;
  idoso_id: string;
  voluntario_id?: string;
  idoso?: Elder;
  voluntario?: Volunteer;
  atividade: string;
  descricao: string;
  data: string;
  hora: string;
  latitude: number;
  longitude: number;
  local_descricao: string;
  status: 'pendente' | 'aceito' | 'em_andamento' | 'concluido' | 'cancelado';
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  autor_id: string;
  destinatario_id: string;
  autor?: User;
  destinatario?: User;
  tipo: string;
  nota: number;
  comentario?: string;
  data: string;
}

export interface ONG {
  id: string;
  usuario_id: string;
  usuario?: User;
  nome: string;
  cnpj: string;
  telefone: string;
  responsavel: string;
  foto_url?: string;
  latitude?: number;
  longitude?: number;
  ativo: boolean;
}

export default api;
