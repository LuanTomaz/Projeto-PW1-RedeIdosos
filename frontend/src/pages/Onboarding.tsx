import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, HandHeart, MapPin, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { authAPI, filesAPI, API_BASE_URL } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import LocationPickerMap from '@/components/LocationPickerMap';
import { formatCnpj, formatCpf, formatPhone, formatRg } from '@/lib/format';

type Coordenadas = {
  latitude: string;
  longitude: string;
};

export default function Onboarding() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coords, setCoords] = useState<Coordenadas>({ latitude: '', longitude: '' });
  const [rg, setRg] = useState('');
  const [cpf, setCpf] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [rgFile, setRgFile] = useState<File | null>(null);
  const [cpfFile, setCpfFile] = useState<File | null>(null);
  const [residenceFile, setResidenceFile] = useState<File | null>(null);
  const [volunteerDocs, setVolunteerDocs] = useState<File[]>([]);

  const [elderForm, setElderForm] = useState({
    endereco: '',
    data_nascimento: '',
    necessidades_especiais: '',
  });

  const [volunteerForm, setVolunteerForm] = useState({
    disponibilidade: '',
    area_atuacao: '',
  });

  const [ongForm, setOngForm] = useState({
    cnpj: '',
    responsavel: '',
    telefone: '',
  });

  const isOng = user?.tipo_cadastro === 'ong';
  const isVolunteer = user?.tipo_cadastro === 'voluntario';
  const isElder = user?.tipo_cadastro === 'idoso';

  const roleInfo = useMemo(() => {
    if (!user) return null;
    if (isElder) {
        const rgDigits = rg.replace(/\D/g, '');
        const cpfDigits = cpf.replace(/\D/g, '');
        if (rgDigits.length < 7 || rgDigits.length > 9) {
          toast({
            title: 'RG invÃ¡lido',
            description: 'O RG deve ter entre 7 e 9 dígitos.',
            variant: 'destructive',
          });
          return;
        }
        if (cpfDigits.length !== 11) {
          toast({
            title: 'CPF invÃ¡lido',
            description: 'O CPF deve ter 11 dígitos.',
            variant: 'destructive',
          });
          return;
        }
      return {
        title: 'Complete seu cadastro de Idoso',
        description: 'Informe seus dados para criar seu perfil na plataforma.',
        icon: UserCircle,
      };
    }
    if (isVolunteer) {
      return {
        title: 'Complete seu cadastro de VoluntÃ¡rio',
        description: 'Informe seus dados para comeÃ§ar a ajudar.',
        icon: HandHeart,
      };
    }
    return {
      title: 'Complete o cadastro da ONG',
      description: 'Informe os dados da organizaÃ§Ã£o.',
      icon: Building2,
    };
  }, [user, isElder, isVolunteer, isOng]);

  if (!user || !roleInfo) return null;

  const parseCoords = () => {
    const latitude = Number(coords.latitude);
    const longitude = Number(coords.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }
    return { latitude, longitude };
  };

  const parsedLatitude = Number(coords.latitude);
  const parsedLongitude = Number(coords.longitude);
  const mapLatitude = Number.isFinite(parsedLatitude) ? parsedLatitude : undefined;
  const mapLongitude = Number.isFinite(parsedLongitude) ? parsedLongitude : undefined;

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

  const handleSubmit = async () => {
    const parsed = parseCoords();
    if (!parsed) {
      toast({
        title: 'Coordenadas invÃ¡lidas',
        description: 'Informe latitude e longitude vÃ¡lidas.',
        variant: 'destructive',
      });
      return;
    }
    const requiresPersonalDocs = !isOng;
    const missingCoreDocs = !profilePhoto || !residenceFile;
    const missingPersonalDocs = requiresPersonalDocs && (!rg.trim() || !cpf.trim() || !rgFile || !cpfFile);
    if (missingCoreDocs || missingPersonalDocs) {
      toast({
        title: 'Documentos obrigatÃ³rios',
        description: isOng
          ? 'Anexe foto de perfil e comprovante de residÃªncia.'
          : 'Anexe foto de perfil, RG, CPF e comprovante de residÃªncia.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const [photoUrl, residenceUrl] = await Promise.all([
        uploadFile(profilePhoto),
        uploadFile(residenceFile),
      ]);

      if (requiresPersonalDocs) {
        await Promise.all([uploadFile(rgFile), uploadFile(cpfFile)]);
      }
      const extraDocs = volunteerDocs.length
        ? await Promise.all(volunteerDocs.map((file) => uploadFile(file)))
        : [];

      if (isElder) {
        const rgDigits = rg.replace(/\D/g, '');
        const cpfDigits = cpf.replace(/\D/g, '');
        if (rgDigits.length < 7 || rgDigits.length > 9) {
          toast({
            title: 'RG invÃ¡lido',
            description: 'O RG deve ter entre 7 e 9 dígitos.',
            variant: 'destructive',
          });
          return;
        }
        if (cpfDigits.length !== 11) {
          toast({
            title: 'CPF invÃ¡lido',
            description: 'O CPF deve ter 11 dígitos.',
            variant: 'destructive',
          });
          return;
        }
        if (!elderForm.endereco || !elderForm.data_nascimento) {
          toast({
            title: 'Dados incompletos',
            description: 'Preencha endereÃ§o e data de nascimento.',
            variant: 'destructive',
          });
          return;
        }
        await authAPI.registerElderProfile({
          endereco: elderForm.endereco,
          data_nascimento: elderForm.data_nascimento,
          necessidades_especiais: elderForm.necessidades_especiais || undefined,
          latitude: parsed.latitude,
          longitude: parsed.longitude,
          rg: rg.trim(),
          cpf: cpf.trim(),

          comprovante_residencia_url: residenceUrl,
          foto_perfil_url: photoUrl,
        });
      } else if (isVolunteer) {
        const rgDigits = rg.replace(/\D/g, '');
        const cpfDigits = cpf.replace(/\D/g, '');
        if (rgDigits.length < 7 || rgDigits.length > 9) {
          toast({
            title: 'RG invÃ¡lido',
            description: 'O RG deve ter entre 7 e 9 dígitos.',
            variant: 'destructive',
          });
          return;
        }
        if (cpfDigits.length !== 11) {
          toast({
            title: 'CPF invÃ¡lido',
            description: 'O CPF deve ter 11 dígitos.',
            variant: 'destructive',
          });
          return;
        }
        await authAPI.registerVolunteerProfile({
          disponibilidade: volunteerForm.disponibilidade || undefined,
          area_atuacao: volunteerForm.area_atuacao || undefined,
          latitude: parsed.latitude,
          longitude: parsed.longitude,
          rg: rg.trim(),
          cpf: cpf.trim(),
          documentos_url: extraDocs,
          rg: rg.trim(),
          cpf: cpf.trim(),

          comprovante_residencia_url: residenceUrl,
          foto_perfil_url: photoUrl,
        });
      } else {
        const cnpjDigits = ongForm.cnpj.replace(/\D/g, '');
        const phoneDigits = ongForm.telefone.replace(/\D/g, '');
        if (cnpjDigits.length !== 14) {
          toast({
            title: 'CNPJ invÃ¡lido',
            description: 'O CNPJ deve ter 14 dígitos.',
            variant: 'destructive',
          });
          return;
        }
        if (phoneDigits.length < 10 || phoneDigits.length > 11) {
          toast({
            title: 'Telefone invÃ¡lido',
            description: 'O telefone deve ter 10 ou 11 dígitos.',
            variant: 'destructive',
          });
          return;
        }
        if (!ongForm.cnpj || !ongForm.responsavel || !ongForm.telefone) {
          toast({
            title: 'Dados incompletos',
            description: 'Informe CNPJ, responsÃ¡vel e telefone.',
            variant: 'destructive',
          });
          return;
        }
        await authAPI.registerOngProfile({
          cnpj: ongForm.cnpj,
          responsavel: ongForm.responsavel,
          telefone: ongForm.telefone,
          latitude: parsed.latitude,
          longitude: parsed.longitude,
          rg: rg.trim(),
          cpf: cpf.trim(),

          comprovante_residencia_url: residenceUrl,
          foto_perfil_url: photoUrl,
        });
      }

      updateUser({
        ...user,
        ativo: true,
        ...(isOng ? {} : { rg: rg.trim(), cpf: cpf.trim() }),
        comprovante_residencia_url: residenceUrl,
        foto_perfil_url: photoUrl,
      });
      toast({
        title: 'Perfil criado com sucesso',
        description: 'Agora sua conta aguarda validaÃ§Ã£o.',
      });
      navigate('/dashboard/pending');
    } catch (error: unknown) {
      toast({
        title: 'Erro ao concluir cadastro',
        description: 'Tente novamente ou verifique os dados informados.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">{roleInfo.title}</h1>
          <p className="mt-1 text-muted-foreground">{roleInfo.description}</p>
        </div>
        <roleInfo.icon className="h-10 w-10 text-primary" />
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Dados do Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {isElder && (
            <>
              <div className="space-y-2">
                <Label>EndereÃ§o</Label>
                <Input
                  value={elderForm.endereco}
                  onChange={(e) => setElderForm((prev) => ({ ...prev, endereco: e.target.value }))}
                  placeholder="Rua, nÃºmero, bairro"
                />
              </div>
              <div className="space-y-2">
                <Label>Data de nascimento</Label>
                <Input
                  type="date"
                  value={elderForm.data_nascimento}
                  onChange={(e) => setElderForm((prev) => ({ ...prev, data_nascimento: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Necessidades especiais (opcional)</Label>
                <Textarea
                  value={elderForm.necessidades_especiais}
                  onChange={(e) => setElderForm((prev) => ({ ...prev, necessidades_especiais: e.target.value }))}
                  rows={3}
                />
              </div>
            </>
          )}

          {isVolunteer && (
            <>
              <div className="space-y-2">
                <Label>Disponibilidade</Label>
                <Select
                  value={volunteerForm.disponibilidade}
                  onValueChange={(value) => setVolunteerForm((prev) => ({ ...prev, disponibilidade: value }))}
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
                  value={volunteerForm.area_atuacao}
                  onChange={(e) => setVolunteerForm((prev) => ({ ...prev, area_atuacao: e.target.value }))}
                  placeholder="Ex: Acompanhamento, visitas"
                />
              </div>
            </>
          )}
          {isOng && (
            <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/40 p-4">
              <p className="text-sm font-semibold text-emerald-700">Dados da ONG</p>
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input
                    value={ongForm.cnpj}
                    onChange={(e) =>
                      setOngForm((prev) => ({ ...prev, cnpj: formatCnpj(e.target.value) }))
                    }
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                  />
                </div>
                <div className="space-y-2">
                  <Label>ResponsÃ¡vel</Label>
                  <Input
                    value={ongForm.responsavel}
                    onChange={(e) => setOngForm((prev) => ({ ...prev, responsavel: e.target.value }))}
                    placeholder="Nome do responsÃ¡vel"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone (obrigatÃ³rio)</Label>
                  <Input
                    value={ongForm.telefone}
                    onChange={(e) =>
                      setOngForm((prev) => ({ ...prev, telefone: formatPhone(e.target.value) }))
                    }
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                </div>
              </div>
            </div>
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

          {isVolunteer && (
            <div className="space-y-2">
              <Label>Documentos adicionais (opcional)</Label>
              <Input
                type="file"
                multiple
                onChange={(e) => setVolunteerDocs(Array.from(e.target.files ?? []))}
              />
              <p className="text-xs text-muted-foreground">
                Anexe outros documentos que ajudem na validaÃ§Ã£o.
              </p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Latitude</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={coords.latitude}
                  onChange={(e) => setCoords((prev) => ({ ...prev, latitude: e.target.value }))}
                  placeholder="-23.5505"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Longitude</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={coords.longitude}
                  onChange={(e) => setCoords((prev) => ({ ...prev, longitude: e.target.value }))}
                  placeholder="-46.6333"
                  className="pl-9"
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
                setCoords({
                  latitude: lat.toFixed(6),
                  longitude: lng.toFixed(6),
                })
              }
              height={240}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Concluir cadastro'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

























