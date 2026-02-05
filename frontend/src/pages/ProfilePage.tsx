import { useEffect, useMemo, useState } from 'react';
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
import { eldersAPI, filesAPI, ongsAPI, volunteersAPI, API_BASE_URL } from '@/lib/api';
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

  const isElder = user?.papel === 'idoso';
  const isVolunteer = user?.papel === 'voluntario';
  const isOng = user?.papel === 'ong';

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
  const [rg, setRg] = useState('');
  const [cpf, setCpf] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [rgFile, setRgFile] = useState<File | null>(null);
  const [cpfFile, setCpfFile] = useState<File | null>(null);
  const [residenceFile, setResidenceFile] = useState<File | null>(null);

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

  useEffect(() => {
    if (user) {
      setRg(user.rg ?? '');
      setCpf(user.cpf ?? '');
    }
  }, [user]);

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

      if (isElder) {
        const response = await eldersAPI.updateMe({
          endereco: form.endereco,
          data_nascimento: form.data_nascimento,
          necessidades_especiais: form.necessidades_especiais || undefined,
          ...location,
          ...updates,
        });
        return { response, userUpdates: updates };
      }

      if (isVolunteer) {
        const response = await volunteersAPI.updateMe({
          disponibilidade: form.disponibilidade || undefined,
          area_atuacao: form.area_atuacao || undefined,
          ...location,
          ...updates,
        });
        return { response, userUpdates: updates };
      }

      if (isOng) {
        const response = await ongsAPI.updateMe({
          cnpj: form.cnpj,
          responsavel: form.responsavel,
          telefone: form.telefone || undefined,
          ...location,
          ...updates,
        });
        return { response, userUpdates: updates };
      }

      return { response: undefined, userUpdates: updates };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({ title: 'Perfil atualizado com sucesso' });
      if (user) {
        updateUser({
          ...user,
          ...(isOng ? {} : { rg: rg.trim() || user.rg, cpf: cpf.trim() || user.cpf }),
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
            <LocationPickerMap
              latitude={mapLatitude}
              longitude={mapLongitude}
              onChange={(lat, lng) =>
                setForm((prev) => ({
                  ...prev,
                  latitude: lat.toFixed(6),
                  longitude: lng.toFixed(6),
                }))
              }
              height={240}
            />
          </div>

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













