import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, HandHeart, MapPin, UserCircle } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { eldersAPI, filesAPI, ongsAPI, usersAPI, volunteersAPI, API_BASE_URL } from '@/lib/api';
import { formatCnpj, formatCpf, formatPhone, formatRg } from '@/lib/format';
import { useAuth } from '@/contexts/AuthContext';
import LocationPickerMap from '@/components/LocationPickerMap';

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { error?: string } } }).response;
    if (response?.data?.error) return response.data.error;
  }
  return fallback;
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const profileType = user?.tipo_cadastro;
  const isElder = profileType === 'idoso';
  const isVolunteer = profileType === 'voluntario';
  const isOng = profileType === 'ong';

  const { data: elderProfile } = useQuery({
    queryKey: ['profile', 'elder'],
    queryFn: async () => (await eldersAPI.getMe()).data,
    enabled: isElder,
  });

  const { data: volunteerProfile } = useQuery({
    queryKey: ['profile', 'volunteer'],
    queryFn: async () => (await volunteersAPI.getMe()).data,
    enabled: isVolunteer,
  });

  const { data: ongProfile } = useQuery({
    queryKey: ['profile', 'ong'],
    queryFn: async () => (await ongsAPI.getMe()).data,
    enabled: isOng,
  });

  const [form, setForm] = useState({
    endereco: '',
    data_nascimento: '',
    necessidades_especiais: '',
    disponibilidade: '',
    area_atuacao: '',
    cnpj: '',
    responsavel: '',
    telefone: '',
    latitude: '',
    longitude: '',
  });
  const [userForm, setUserForm] = useState({
    nome: '',
    email: '',
    telefone: '',
  });
  const [hasPrefilledUserForm, setHasPrefilledUserForm] = useState(false);
  const [rg, setRg] = useState('');
  const [cpf, setCpf] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [rgFile, setRgFile] = useState<File | null>(null);
  const [cpfFile, setCpfFile] = useState<File | null>(null);
  const [residenceFile, setResidenceFile] = useState<File | null>(null);
  const [prefillSource, setPrefillSource] = useState<'user' | 'profile' | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (elderProfile) {
      setForm((prev) => ({
        ...prev,
        endereco: elderProfile.endereco ?? '',
        data_nascimento: elderProfile.data_nascimento?.slice(0, 10) ?? '',
        necessidades_especiais: elderProfile.necessidades_especiais ?? '',
        latitude: typeof elderProfile.latitude === 'number' ? String(elderProfile.latitude) : '',
        longitude: typeof elderProfile.longitude === 'number' ? String(elderProfile.longitude) : '',
      }));
    }
  }, [elderProfile]);

  useEffect(() => {
    if (volunteerProfile) {
      setForm((prev) => ({
        ...prev,
        disponibilidade: volunteerProfile.disponibilidade ?? '',
        area_atuacao: volunteerProfile.area_atuacao ?? '',
        latitude: typeof volunteerProfile.latitude === 'number' ? String(volunteerProfile.latitude) : '',
        longitude: typeof volunteerProfile.longitude === 'number' ? String(volunteerProfile.longitude) : '',
      }));
    }
  }, [volunteerProfile]);

  useEffect(() => {
    if (ongProfile) {
      setForm((prev) => ({
        ...prev,
        cnpj: ongProfile.cnpj ?? '',
        responsavel: ongProfile.responsavel ?? '',
        telefone: ongProfile.telefone ?? '',
        latitude: typeof ongProfile.latitude === 'number' ? String(ongProfile.latitude) : '',
        longitude: typeof ongProfile.longitude === 'number' ? String(ongProfile.longitude) : '',
      }));
    }
  }, [ongProfile]);

  const profileUser = elderProfile?.usuario ?? volunteerProfile?.usuario ?? ongProfile?.usuario;

  useEffect(() => {
    const sourceUser = profileUser ?? user;
    if (!hasPrefilledUserForm && sourceUser) {
      setUserForm({
        nome: sourceUser.nome ?? '',
        email: sourceUser.email ?? '',
        telefone: sourceUser.telefone ? formatPhone(sourceUser.telefone) : '',
      });
      setHasPrefilledUserForm(true);
    }

    if (profileUser && prefillSource !== 'profile') {
      setRg(profileUser.rg ? formatRg(profileUser.rg) : '');
      setCpf(profileUser.cpf ? formatCpf(profileUser.cpf) : '');
      setPrefillSource('profile');
      return;
    }

    if (!profileUser && user && prefillSource === null && !rg && !cpf) {
      setRg(user.rg ? formatRg(user.rg) : '');
      setCpf(user.cpf ? formatCpf(user.cpf) : '');
      setPrefillSource('user');
    }
  }, [cpf, hasPrefilledUserForm, prefillSource, profileUser, rg, user]);

  const applyCoordinates = useCallback((latitude: number, longitude: number) => {
    setForm((prev) => ({
      ...prev,
      latitude: latitude.toFixed(6),
      longitude: longitude.toFixed(6),
    }));
  }, []);

  const requestCurrentLocation = useCallback(
    (options?: { silent?: boolean }) => {
      if (!navigator.geolocation) {
        if (!options?.silent) {
          toast({
            title: 'Localização indisponível',
            description: 'Seu navegador não suporta geolocalização.',
            variant: 'destructive',
          });
        }
        return;
      }

      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          applyCoordinates(position.coords.latitude, position.coords.longitude);
          setIsLocating(false);
          if (!options?.silent) {
            toast({ title: 'Localização atualizada' });
          }
        },
        (error) => {
          setIsLocating(false);
          if (!options?.silent) {
            toast({
              title: 'Não foi possível obter a localização',
              description: error.message || 'Tente novamente.',
              variant: 'destructive',
            });
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    },
    [applyCoordinates, toast]
  );


  const toAbsoluteUrl = (url: string) => {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return `${API_BASE_URL}${url}`;
    return `${API_BASE_URL}/${url}`;
  };

  const uploadFile = async (file: File) => {
    if (!user) throw new Error('UsuÃ¡rio nÃ£o autenticado');
    const response = await filesAPI.upload(file, 'user', user.id);
    const url = response.data?.file?.url ?? '';
    return toAbsoluteUrl(url);
  };

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const updates: {
        rg?: string;
        cpf?: string;
        comprovante_residencia_url?: string;
        foto_perfil_url?: string;
      } = {};
      const userUpdates: {
        nome?: string;
        email?: string;
        telefone?: string;
      } = {};
      if (!isOng) {
        if (rg.trim()) updates.rg = rg.trim();
        if (cpf.trim()) updates.cpf = cpf.trim();
      }

      if (!isOng) {
        const rgDigits = rg.replace(/\D/g, '');
        const cpfDigits = cpf.replace(/\D/g, '');
        if (rgDigits && (rgDigits.length < 7 || rgDigits.length > 9)) {
          throw new Error('RG deve ter entre 7 e 9 dígitos');
        }
        if (cpfDigits && cpfDigits.length !== 11) {
          throw new Error('CPF deve ter 11 dígitos');
        }
      }

      if (isOng) {
        const cnpjDigits = form.cnpj.replace(/\D/g, '');
        const phoneDigits = form.telefone.replace(/\D/g, '');
        if (cnpjDigits && cnpjDigits.length !== 14) {
          throw new Error('CNPJ deve ter 14 dígitos');
        }
        if (phoneDigits && (phoneDigits.length < 10 || phoneDigits.length > 11)) {
          throw new Error('Telefone deve ter 10 ou 11 dígitos');
        }
      }

      if (profilePhoto) {
        updates.foto_perfil_url = await uploadFile(profilePhoto);
      }
      if (residenceFile) {
        updates.comprovante_residencia_url = await uploadFile(residenceFile);
      }
      if (!isOng && rgFile) {
        await uploadFile(rgFile);
      }
      if (!isOng && cpfFile) {
        await uploadFile(cpfFile);
      }

      const latitude = Number(form.latitude);
      const longitude = Number(form.longitude);
      const location = Number.isFinite(latitude) && Number.isFinite(longitude)
        ? { latitude, longitude }
        : {};

      if (user) {
        const nomeTrimmed = userForm.nome.trim();
        const emailTrimmed = userForm.email.trim();
        const telefoneTrimmed = userForm.telefone.trim();

        if (nomeTrimmed && nomeTrimmed !== user.nome) userUpdates.nome = nomeTrimmed;
        if (emailTrimmed && emailTrimmed !== user.email) userUpdates.email = emailTrimmed;
        if (telefoneTrimmed && telefoneTrimmed !== (user.telefone ?? '')) {
          userUpdates.telefone = telefoneTrimmed;
        }
      }

      const shouldSendLocation = Number.isFinite(latitude) && Number.isFinite(longitude);
      const shouldUpdateUser = Object.keys(userUpdates).length > 0 || shouldSendLocation;
      const updatedUserResponse = shouldUpdateUser
        ? await usersAPI.updateMe({
            ...userUpdates,
            ...(shouldSendLocation ? { latitude, longitude } : {}),
          })
        : undefined;

      if (isElder) {
        const response = await eldersAPI.updateMe({
          endereco: form.endereco,
          data_nascimento: form.data_nascimento,
          necessidades_especiais: form.necessidades_especiais || undefined,
          ...location,
          ...updates,
        });
        return { response, userUpdates: updates, updatedUser: updatedUserResponse?.data };
      }

      if (isVolunteer) {
        const response = await volunteersAPI.updateMe({
          disponibilidade: form.disponibilidade || undefined,
          area_atuacao: form.area_atuacao || undefined,
          ...location,
          ...updates,
        });
        return { response, userUpdates: updates, updatedUser: updatedUserResponse?.data };
      }

      if (isOng) {
        const response = await ongsAPI.updateMe({
          cnpj: form.cnpj,
          responsavel: form.responsavel,
          telefone: form.telefone || undefined,
          ...location,
          ...updates,
        });
        return { response, userUpdates: updates, updatedUser: updatedUserResponse?.data };
      }

      return { response: undefined, userUpdates: updates, updatedUser: updatedUserResponse?.data };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({ title: 'Perfil atualizado com sucesso' });
      const baseUser = data?.updatedUser ?? user;
      if (baseUser) {
        updateUser({
          ...baseUser,
          ...(isOng ? {} : { rg: rg.trim() || baseUser.rg, cpf: cpf.trim() || baseUser.cpf }),
          ...(data?.userUpdates?.foto_perfil_url && { foto_perfil_url: data.userUpdates.foto_perfil_url }),
          ...(data?.userUpdates?.comprovante_residencia_url && {
            comprovante_residencia_url: data.userUpdates.comprovante_residencia_url,
          }),
        });
      }
    },
    onError: (error: unknown) => {
      toast({
        title: 'Erro ao atualizar perfil',
        description: getErrorMessage(error, 'Tente novamente'),
        variant: 'destructive',
      });
    },
  });

  const header = useMemo(() => {
    if (isElder) return { title: 'Meu perfil', icon: UserCircle };
    if (isVolunteer) return { title: 'Meu perfil', icon: HandHeart };
    if (isOng) return { title: 'Perfil da ONG', icon: Building2 };
    return { title: 'Perfil', icon: UserCircle };
  }, [isElder, isVolunteer, isOng]);

  const parsedLatitude = Number(form.latitude);
  const parsedLongitude = Number(form.longitude);
  const mapLatitude = Number.isFinite(parsedLatitude) ? parsedLatitude : undefined;
  const mapLongitude = Number.isFinite(parsedLongitude) ? parsedLongitude : undefined;
  const isAdmin = user?.papel === 'admin';

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">{header.title}</h1>
          <p className="mt-1 text-muted-foreground">Atualize suas informaÃ§Ãµes pessoais</p>
        </div>
        <header.icon className="h-10 w-10 text-primary" />
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Dados do perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={userForm.nome}
                onChange={(e) => setUserForm((prev) => ({ ...prev, nome: e.target.value }))}
                placeholder="Digite seu nome"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Digite seu email"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input
              value={userForm.telefone}
              onChange={(e) => setUserForm((prev) => ({ ...prev, telefone: formatPhone(e.target.value) }))}
              placeholder="Digite seu telefone"
            />
          </div>
          {isElder && (
            <>
              <div className="space-y-2">
                <Label>EndereÃ§o</Label>
                <Input
                  value={form.endereco}
                  onChange={(e) => setForm((prev) => ({ ...prev, endereco: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Data de nascimento</Label>
                <Input
                  type="date"
                  value={form.data_nascimento}
                  onChange={(e) => setForm((prev) => ({ ...prev, data_nascimento: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Necessidades especiais</Label>
                <Textarea
                  rows={3}
                  value={form.necessidades_especiais}
                  onChange={(e) => setForm((prev) => ({ ...prev, necessidades_especiais: e.target.value }))}
                />
              </div>
            </>
          )}

          {isVolunteer && (
            <>
              <div className="space-y-2">
                <Label>Disponibilidade</Label>
                <Select
                  value={form.disponibilidade}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, disponibilidade: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a disponibilidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manha">ManhÃ£</SelectItem>
                    <SelectItem value="tarde">Tarde</SelectItem>
                    <SelectItem value="noite">Noite</SelectItem>
                    <SelectItem value="integral">Integral</SelectItem>
                    <SelectItem value="fins_de_semana">Fins de semana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ãrea de atuaÃ§Ã£o</Label>
                <Input
                  value={form.area_atuacao}
                  onChange={(e) => setForm((prev) => ({ ...prev, area_atuacao: e.target.value }))}
                />
              </div>
            </>
          )}
          {isOng && (
            <>
              <div className="space-y-2">
                <Label>CNPJ</Label>
                <Input
                  value={form.cnpj}
                  onChange={(e) => setForm((prev) => ({ ...prev, cnpj: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>ResponsÃ¡vel</Label>
                <Input
                  value={form.responsavel}
                  onChange={(e) => setForm((prev) => ({ ...prev, responsavel: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone (obrigatÃ³rio)</Label>
                <Input
                  value={form.telefone}
                  onChange={(e) => setForm((prev) => ({ ...prev, telefone: e.target.value }))}
                />
              </div>
            </>
          )}

          {!isOng && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>RG</Label>
                <Input
                  value={rg}
                  onChange={(e) => setRg(formatRg(e.target.value))}
                  placeholder="Digite o RG"
                  maxLength={12}
                />
              </div>
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input
                  value={cpf}
                  onChange={(e) => setCpf(formatCpf(e.target.value))}
                  placeholder="Digite o CPF"
                  maxLength={14}
                />
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Foto de perfil</Label>
              <Input type="file" accept="image/*" onChange={(e) => setProfilePhoto(e.target.files?.[0] ?? null)} />
            </div>
            {!isOng && (
              <div className="space-y-2">
                <Label>RG (arquivo)</Label>
                <Input type="file" onChange={(e) => setRgFile(e.target.files?.[0] ?? null)} />
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {!isOng && (
              <div className="space-y-2">
                <Label>CPF (arquivo)</Label>
                <Input type="file" onChange={(e) => setCpfFile(e.target.files?.[0] ?? null)} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Comprovante de residÃªncia</Label>
              <Input type="file" onChange={(e) => setResidenceFile(e.target.files?.[0] ?? null)} />
            </div>
          </div>

          {!isAdmin && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      value={form.latitude}
                      onChange={(e) => setForm((prev) => ({ ...prev, latitude: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      value={form.longitude}
                      onChange={(e) => setForm((prev) => ({ ...prev, longitude: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{isOng ? 'Selecione o Local da ong' : 'Selecione no mapa'}</Label>
                <p className="text-xs text-muted-foreground">
                  Clique no mapa para preencher latitude e longitude automaticamente.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => requestCurrentLocation()}
                  disabled={isLocating}
                  className="mb-3"
                >
                  {isLocating ? 'Localizando...' : 'Usar localização atual'}
                </Button>
                <LocationPickerMap
                  latitude={mapLatitude}
                  longitude={mapLongitude}
                  onChange={(lat, lng) => applyCoordinates(lat, lng)}
                  height={240}
                />
              </div>
            </>
          )}

          <div className="flex justify-end">
            <Button onClick={() => updateProfileMutation.mutate()} disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar alteraÃ§Ãµes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}













