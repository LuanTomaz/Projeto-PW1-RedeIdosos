import axios from 'axios';

export const API_BASE_URL = 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getId = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const id = record._id ?? record.id;
    if (typeof id === 'string') return id;
  }
  return '';
};

const parseCoordinates = (
  raw: Record<string, unknown>
): { latitude?: number; longitude?: number } => {
  const localizacao = raw.localizacao as
    | { coordinates?: [number, number] }
    | undefined;
  if (localizacao?.coordinates?.length === 2) {
    const [longitude, latitude] = localizacao.coordinates;
    return { latitude, longitude };
  }

  const latitude = typeof raw.latitude === 'number' ? raw.latitude : undefined;
  const longitude =
    typeof raw.longitude === 'number' ? raw.longitude : undefined;
  return { latitude, longitude };
};

const toBackendLocation = (
  latitude?: number,
  longitude?: number
):
  | { type: 'Point'; coordinates: [number, number] }
  | undefined => {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return undefined;
  }
  return {
    type: 'Point',
    coordinates: [longitude, latitude],
  };
};

const statusToFrontend = (
  status?: string
): Companionship['status'] | undefined => {
  if (status === 'aceita') return 'aceito';
  if (status === 'concluida') return 'concluido';
  if (status === 'cancelada') return 'cancelado';
  if (
    status === 'pendente' ||
    status === 'aceito' ||
    status === 'em_andamento' ||
    status === 'concluido' ||
    status === 'cancelado'
  ) {
    return status;
  }
  return undefined;
};

const statusToBackend = (status: string): string => {
  if (status === 'aceito') return 'aceita';
  if (status === 'concluido') return 'concluida';
  if (status === 'cancelado') return 'cancelada';
  return status;
};

const normalizeUser = (raw: unknown): User => {
  const data = (raw ?? {}) as Record<string, unknown>;
  return {
    id: getId(data),
    nome: String(data.nome ?? ''),
    email: String(data.email ?? ''),
    papel: (String(data.papel ?? 'pending') as User['papel']),
    tipo_cadastro: String(data.tipo_cadastro ?? 'voluntario') as User['tipo_cadastro'],
    telefone: typeof data.telefone === 'string' ? data.telefone : undefined,
    foto_perfil_url:
      typeof data.foto_perfil_url === 'string' ? data.foto_perfil_url : undefined,
    rg: typeof data.rg === 'string' ? data.rg : undefined,
    cpf: typeof data.cpf === 'string' ? data.cpf : undefined,
    comprovante_residencia_url:
      typeof data.comprovante_residencia_url === 'string'
        ? data.comprovante_residencia_url
        : undefined,
    verificado: Boolean(data.verificado),
    ativo: data.ativo === undefined ? true : Boolean(data.ativo),
    bloqueado: Boolean(data.bloqueado),
  };
};

const normalizeElder = (raw: unknown): Elder => {
  const data = (raw ?? {}) as Record<string, unknown>;
  const { latitude, longitude } = parseCoordinates(data);
  const userObject =
    data.usuario_id && typeof data.usuario_id === 'object'
      ? normalizeUser(data.usuario_id)
      : data.usuario && typeof data.usuario === 'object'
      ? normalizeUser(data.usuario)
      : undefined;

  return {
    id: getId(data),
    usuario_id: getId(data.usuario_id),
    usuario: userObject,
    endereco: String(data.endereco ?? ''),
    latitude: latitude ?? 0,
    longitude: longitude ?? 0,
    data_nascimento: String(data.data_nascimento ?? ''),
    necessidades_especiais:
      typeof data.necessidades_especiais === 'string'
        ? data.necessidades_especiais
        : undefined,
  };
};

const normalizeVolunteer = (raw: unknown): Volunteer => {
  const data = (raw ?? {}) as Record<string, unknown>;
  const { latitude, longitude } = parseCoordinates(data);
  const userObject =
    data.usuario_id && typeof data.usuario_id === 'object'
      ? normalizeUser(data.usuario_id)
      : data.usuario && typeof data.usuario === 'object'
      ? normalizeUser(data.usuario)
      : undefined;

  return {
    id: getId(data),
    usuario_id: getId(data.usuario_id),
    usuario: userObject,
    documentos_url: Array.isArray(data.documentos_url)
      ? data.documentos_url.filter((item) => typeof item === 'string') as string[]
      : typeof data.documentos_url === 'string'
      ? [data.documentos_url]
      : undefined,
    disponibilidade:
      typeof data.disponibilidade === 'string' ? data.disponibilidade : undefined,
    area_atuacao:
      typeof data.area_atuacao === 'string' ? data.area_atuacao : undefined,
    latitude,
    longitude,
  };
};

const normalizeCompanionship = (raw: unknown): Companionship => {
  const data = (raw ?? {}) as Record<string, unknown>;
  const { latitude, longitude } = parseCoordinates(data);

  const elderObject =
    data.idoso_id && typeof data.idoso_id === 'object'
      ? normalizeElder(data.idoso_id)
      : undefined;
  const volunteerObject =
    data.voluntario_id && typeof data.voluntario_id === 'object'
      ? normalizeVolunteer(data.voluntario_id)
      : undefined;

  return {
    id: getId(data),
    idoso_id: getId(data.idoso_id),
    voluntario_id: getId(data.voluntario_id) || undefined,
    idoso: elderObject,
    voluntario: volunteerObject,
    atividade: String(data.atividade ?? ''),
    descricao: String(data.descricao ?? ''),
    data: String(data.data ?? ''),
    hora: String(data.hora ?? ''),
    latitude: latitude ?? 0,
    longitude: longitude ?? 0,
    local_descricao: String(data.local_descricao ?? ''),
    status: statusToFrontend(String(data.status ?? 'pendente')) ?? 'pendente',
    foto_comprovante_url:
      typeof data.foto_comprovante_url === 'string'
        ? data.foto_comprovante_url
        : undefined,
    created_at: String(data.createdAt ?? data.created_at ?? ''),
    updated_at: String(data.updatedAt ?? data.updated_at ?? ''),
  };
};

const normalizeReview = (raw: unknown): Review => {
  const data = (raw ?? {}) as Record<string, unknown>;
  const author =
    data.autor_id && typeof data.autor_id === 'object'
      ? normalizeUser(data.autor_id)
      : undefined;
  const receiver =
    data.destinatario_id && typeof data.destinatario_id === 'object'
      ? normalizeUser(data.destinatario_id)
      : undefined;

  return {
    id: getId(data),
    autor_id: getId(data.autor_id),
    destinatario_id: getId(data.destinatario_id),
    autor: author,
    destinatario: receiver,
    tipo: String(data.tipo ?? ''),
    nota: Number(data.nota ?? 0),
    comentario: typeof data.comentario === 'string' ? data.comentario : undefined,
    foto_comprovante_url:
      typeof data.foto_comprovante_url === 'string'
        ? data.foto_comprovante_url
        : undefined,
    data: String(data.data ?? ''),
  };
};

const normalizeOng = (raw: unknown): ONG => {
  const data = (raw ?? {}) as Record<string, unknown>;
  const { latitude, longitude } = parseCoordinates(data);
  const userObject =
    data.usuario_id && typeof data.usuario_id === 'object'
      ? normalizeUser(data.usuario_id)
      : data.usuario && typeof data.usuario === 'object'
      ? normalizeUser(data.usuario)
      : undefined;

  return {
    id: getId(data),
    usuario_id: getId(data.usuario_id),
    usuario: userObject,
    nome: String(data.nome ?? ''),
    cnpj: String(data.cnpj ?? ''),
    telefone: String(data.telefone ?? ''),
    responsavel: String(data.responsavel ?? ''),
    foto_url: typeof data.foto_url === 'string' ? data.foto_url : undefined,
    latitude,
    longitude,
    ativo: data.ativo === undefined ? true : Boolean(data.ativo),
  };
};

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

export const authAPI = {
  login: (email: string, senha: string) =>
    api.post('/api/auth/login', { email, senha_hash: senha }).then((response) => ({
      ...response,
      data: {
        ...response.data,
        user: normalizeUser(response.data?.user),
      },
    })),
  register: (data: RegisterData) => api.post('/api/users/create-user', data),
  logout: () => api.post('/api/auth/logout'),
  registerElderProfile: (data: ElderData & UserDocumentsData) =>
    api
      .post('/api/auth/profiles/elder', {
        endereco: data.endereco,
        data_nascimento: data.data_nascimento,
        necessidades_especiais: data.necessidades_especiais,
        localizacao: toBackendLocation(data.latitude, data.longitude),
        rg: data.rg,
        cpf: data.cpf,
        comprovante_residencia_url: data.comprovante_residencia_url,
        foto_perfil_url: data.foto_perfil_url,
      })
      .then((response) => ({ ...response, data: normalizeElder(response.data) })),
  registerVolunteerProfile: (data: VolunteerData & UserDocumentsData) =>
    api
      .post('/api/auth/profiles/volunteer', {
        disponibilidade: data.disponibilidade,
        area_atuacao: data.area_atuacao,
        localizacao: toBackendLocation(data.latitude, data.longitude),
        documentos_url: data.documentos_url,
        rg: data.rg,
        cpf: data.cpf,
        comprovante_residencia_url: data.comprovante_residencia_url,
        foto_perfil_url: data.foto_perfil_url,
      })
      .then((response) => ({ ...response, data: normalizeVolunteer(response.data) })),
  registerOngProfile: (data: Partial<ONG> & UserDocumentsData) =>
    api.post('/api/auth/profiles/ong', {
      cnpj: data.cnpj,
      responsavel: data.responsavel,
      telefone: data.telefone,
      localizacao: toBackendLocation(data.latitude, data.longitude),
      comprovante_residencia_url: data.comprovante_residencia_url,
      foto_perfil_url: data.foto_perfil_url,
    }),
};

export const usersAPI = {
  getAll: (role?: string) =>
    api.get('/api/users/list-users', { params: { papel: role } }).then((response) => ({
      ...response,
      data: Array.isArray(response.data)
        ? response.data.map(normalizeUser)
        : [],
    })),
  getById: (id: string) =>
    api.get('/api/users/list-users').then((response) => {
      const users = Array.isArray(response.data)
        ? response.data.map(normalizeUser)
        : [];
      return { ...response, data: users.find((user) => user.id === id) };
    }),
  create: (data: CreateUserData) => api.post('/api/users/create-user', data),
  updateRole: (id: string) => api.put(`/api/users/${id}/promote-admin`),
  updateStatus: (id: string, ativo: boolean) =>
    api.put(`/api/users/${id}/status`, { ativo }),
  update: (id: string, data: UpdateUserData) =>
    api.put(`/api/users/${id}/update`, data),
  validate: (id: string) => api.put(`/api/users/${id}/validate`),
  verify: (id: string) => api.put(`/api/users/${id}/validate`),
  delete: (id: string) => api.delete(`/api/users/${id}/delete`),
};

export const eldersAPI = {
  getAll: () =>
    api.get('/api/elders/get-elders').then((response) => ({
      ...response,
      data: Array.isArray(response.data)
        ? response.data.map(normalizeElder)
        : [],
    })),
  getMe: () =>
    api.get('/api/elders/me/profile').then((response) => ({
      ...response,
      data: normalizeElder(response.data),
    })),
  create: (data: ElderData) =>
    authAPI.registerElderProfile(data).then((response) => ({
      ...response,
      data: normalizeElder(response.data),
    })),
  updateMe: (data: Partial<ElderData>) =>
    api
      .put('/api/elders/me/update', {
        ...data,
        localizacao: toBackendLocation(data.latitude, data.longitude),
      })
      .then((response) => ({ ...response, data: normalizeElder(response.data) })),
  updateLocation: (latitude: number, longitude: number) =>
    api.put('/api/elders/me/location', { latitude, longitude }),
  delete: (id: string) => api.delete(`/api/elders/${id}/delete-elder`),
};

export const volunteersAPI = {
  getAll: () =>
    api.get('/api/volunteers/list').then((response) => ({
      ...response,
      data: Array.isArray(response.data)
        ? response.data.map(normalizeVolunteer)
        : [],
    })),
  getMe: () =>
    api.get('/api/volunteers/me/profile').then((response) => ({
      ...response,
      data: normalizeVolunteer(response.data),
    })),
  updateMe: (data: Partial<VolunteerData>) =>
    api
      .put('/api/volunteers/update-profile', {
        ...data,
        localizacao: toBackendLocation(data.latitude, data.longitude),
      })
      .then((response) => ({ ...response, data: normalizeVolunteer(response.data) })),
  updateLocation: (latitude: number, longitude: number) =>
    api.put('/api/volunteers/update-location', { latitude, longitude }),
  delete: (id: string) => api.delete(`/api/volunteers/${id}/delete`),
};

export const companionshipsAPI = {
  getAll: () =>
    api.get('/api/companionships/list-companionships').then((response) => ({
      ...response,
      data: Array.isArray(response.data)
        ? response.data.map(normalizeCompanionship)
        : [],
    })),
  getById: (id: string) =>
    api.get('/api/companionships/list-companionships').then((response) => {
      const items = Array.isArray(response.data)
        ? response.data.map(normalizeCompanionship)
        : [];
      return { ...response, data: items.find((item) => item.id === id) };
    }),
  getMine: () =>
    api.get('/api/companionships/my-companionships').then((response) => ({
      ...response,
      data: Array.isArray(response.data)
        ? response.data.map(normalizeCompanionship)
        : [],
    })),
  getNearby: (lat: number, lng: number) =>
    api.get('/api/companionships/list-companionships', { params: { lat, lng } }).then((response) => ({
      ...response,
      data: Array.isArray(response.data)
        ? response.data.map(normalizeCompanionship)
        : [],
    })),
  create: (data: CompanionshipData) =>
    api
      .post('/api/companionships/create-companionship', {
        ...data,
        localizacao: toBackendLocation(data.latitude, data.longitude),
      })
      .then((response) => ({ ...response, data: normalizeCompanionship(response.data) })),
  update: (id: string, data: Partial<CompanionshipData>) =>
    api
      .put(`/api/companionships/${id}/update`, {
        ...data,
        localizacao: toBackendLocation(data.latitude, data.longitude),
      })
      .then((response) => ({ ...response, data: normalizeCompanionship(response.data) })),
  updateStatus: (id: string, status: string) =>
    api
      .put(`/api/companionships/${id}/status`, {
        status: statusToBackend(status),
      })
      .then((response) => ({ ...response, data: normalizeCompanionship(response.data) })),
  accept: (id: string) =>
    api
      .patch(`/api/companionships/${id}/accept`)
      .then((response) => ({ ...response, data: normalizeCompanionship(response.data) })),
  complete: (id: string, payload: FormData | File) => {
    const formData = payload instanceof FormData ? payload : (() => {
      const fd = new FormData();
      fd.append('foto_comprovante', payload);
      return fd;
    })();
    return api.put(`/api/companionships/${id}/complete`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id: string) => api.delete(`/api/companionships/${id}/delete`),
};

export const reviewsAPI = {
  getAll: () =>
    api.get('/api/reviews/view-reviews').then((response) => ({
      ...response,
      data: Array.isArray(response.data)
        ? response.data.map(normalizeReview)
        : [],
    })),
  getMine: () =>
    api.get('/api/reviews/view-reviews').then((response) => ({
      ...response,
      data: Array.isArray(response.data)
        ? response.data.map(normalizeReview)
        : [],
    })),
  create: (data: ReviewData, foto?: File) => {
    const formData = new FormData();
    formData.append(
      'tipo',
      data.tipo === 'idoso_para_voluntario' || data.tipo === 'voluntario'
        ? 'voluntario'
        : 'idoso'
    );
    formData.append('destinatario_id', data.destinatario_id);
    formData.append('nota', String(data.nota));
    if (data.comentario) formData.append('comentario', data.comentario);
    if (foto) formData.append('foto', foto);
    return api.post('/api/reviews/create-review', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const filesAPI = {
  upload: (file: File, entityType: string, entityId: string) => {
    if (!entityType || !entityId) {
      return Promise.reject(new Error('entidade_tipo e entidade_id sao obrigatorios'));
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entidade_tipo', entityType);
    formData.append('entidade_id', entityId);
    return api.post('/api/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getByEntity: (entityType: string, entityId: string) =>
    api.get(`/api/files/entity/${entityType}/${entityId}`),
  getById: (id: string) => api.get(`/api/files/${id}`),
  delete: (id: string) => api.delete(`/api/files/${id}`),
};

export const verificationsAPI = {
  getAll: () => usersAPI.getAll('voluntario'),
  approve: (id: string) => api.put(`/api/users/${id}/validate`),
  delete: (id: string) => api.put(`/api/users/${id}/block-user`),
};

export const ongsAPI = {
  getAll: () =>
    api.get('/api/ongs/list-ongs').then((response) => ({
      ...response,
      data: Array.isArray(response.data) ? response.data.map(normalizeOng) : [],
    })),
  getById: (id: string) =>
    api.get('/api/ongs/list-ongs', { params: { id } }).then((response) => ({
      ...response,
      data: normalizeOng(response.data),
    })),
  getMe: () =>
    api.get('/api/ongs/profile').then((response) => ({
      ...response,
      data: normalizeOng(response.data),
    })),
  updateMe: (data: Partial<ONG>) =>
    api
      .put('/api/ongs/update-profile', {
        ...data,
        localizacao: toBackendLocation(data.latitude, data.longitude),
      })
      .then((response) => ({ ...response, data: normalizeOng(response.data) })),
  updateLocation: (latitude: number, longitude: number) =>
    api.put('/api/ongs/update-location', { latitude, longitude }),
};

export const mapAPI = {
  getCompanionships: () => companionshipsAPI.getAll(),
  getElders: () => eldersAPI.getAll(),
  getVolunteers: () => volunteersAPI.getAll(),
  getNearbyCompanionships: (lat: number, lng: number) =>
    api.get('/api/companionships/list-companionships', { params: { lat, lng } }),
  getMyCompanionships: () => companionshipsAPI.getMine(),
};

export const reportsAPI = {
  getSummary: (from?: string, to?: string) =>
    api.get('/api/reports/my-reports', { params: { from, to } }),
  getStatistics: () => api.get('/api/reports/all-reports'),
  getLocations: () => api.get('/api/reports/type/locations'),
  getElders: () => api.get('/api/reports/type/elders'),
  getImpact: () => api.get('/api/reports/type/impact'),
  create: (data: ReportData) => api.post('/api/reports/create-report', data),
};

export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
  tipo_cadastro: 'idoso' | 'voluntario' | 'ong';
  telefone?: string;
  cnpj?: string;
}

export interface CreateUserData {
  nome: string;
  email: string;
  senha: string;
  tipo_cadastro: 'idoso' | 'voluntario' | 'ong';
  telefone?: string;
}

export interface UpdateUserData {
  nome?: string;
  email?: string;
  senha?: string;
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
  documentos_url?: string[];
  disponibilidade?: string;
  area_atuacao?: string;
  latitude?: number;
  longitude?: number;
}

export interface CompanionshipData {
  idoso_id?: string;
  voluntario_id?: string;
  atividade: string;
  descricao: string;
  data: string;
  hora: string;
  latitude: number;
  longitude: number;
  local_descricao: string;
  status?: string;
  foto_comprovante_url?: string;
}

export interface ReviewData {
  destinatario_id: string;
  tipo: 'idoso_para_voluntario' | 'voluntario_para_idoso' | 'voluntario' | 'idoso';
  nota: number;
  comentario?: string;
}

export interface ReportData {
  tipo: string;
  descricao?: string;
  data_inicio?: string;
  data_fim?: string;
}

export interface User {
  id: string;
  nome: string;
  email: string;
  papel: 'pending' | 'admin' | 'ong' | 'voluntario' | 'idoso';
  tipo_cadastro: 'idoso' | 'voluntario' | 'ong';
  telefone?: string;
  foto_perfil_url?: string;
  rg?: string;
  cpf?: string;
  comprovante_residencia_url?: string;
  verificado: boolean;
  ativo: boolean;
  bloqueado?: boolean;
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
  documentos_url?: string[];
  disponibilidade?: string;
  area_atuacao?: string;
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
  foto_comprovante_url?: string;
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
  foto_comprovante_url?: string;
  data: string;
}

export interface Report {
  id: string;
  tipo: string;
  descricao?: string;
  data_inicio?: string;
  data_fim?: string;
  gerado_em?: string;
  usuario_id?: string;
  usuario?: User;
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

export interface UserDocumentsData {
  rg?: string;
  cpf?: string;
  comprovante_residencia_url?: string;
  foto_perfil_url?: string;
}

export default api;

