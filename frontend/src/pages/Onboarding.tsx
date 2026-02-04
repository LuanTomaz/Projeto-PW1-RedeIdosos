import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, HandHeart, MapPin, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

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

  const roleInfo = useMemo(() => {
    if (!user) return null;
    if (user.tipo_cadastro === 'idoso') {
      return {
        title: 'Complete seu cadastro de Idoso',
        description: 'Informe seus dados para criar seu perfil na plataforma.',
        icon: UserCircle,
      };
    }
    if (user.tipo_cadastro === 'voluntario') {
      return {
        title: 'Complete seu cadastro de Voluntário',
        description: 'Informe seus dados para começar a ajudar.',
        icon: HandHeart,
      };
    }
    return {
      title: 'Complete o cadastro da ONG',
      description: 'Informe os dados da organização.',
      icon: Building2,
    };
  }, [user]);

  if (!user || !roleInfo) return null;

  const parseCoords = () => {
    const latitude = Number(coords.latitude);
    const longitude = Number(coords.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }
    return { latitude, longitude };
  };

  const handleSubmit = async () => {
    const parsed = parseCoords();
    if (!parsed) {
      toast({
        title: 'Coordenadas inválidas',
        description: 'Informe latitude e longitude válidas.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      if (user.tipo_cadastro === 'idoso') {
        if (!elderForm.endereco || !elderForm.data_nascimento) {
          toast({
            title: 'Dados incompletos',
            description: 'Preencha endereço e data de nascimento.',
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
        });
      } else if (user.tipo_cadastro === 'voluntario') {
        await authAPI.registerVolunteerProfile({
          disponibilidade: volunteerForm.disponibilidade || undefined,
          area_atuacao: volunteerForm.area_atuacao || undefined,
          latitude: parsed.latitude,
          longitude: parsed.longitude,
        });
      } else {
        if (!ongForm.cnpj || !ongForm.responsavel) {
          toast({
            title: 'Dados incompletos',
            description: 'Informe CNPJ e responsável.',
            variant: 'destructive',
          });
          return;
        }
        await authAPI.registerOngProfile({
          cnpj: ongForm.cnpj,
          responsavel: ongForm.responsavel,
          telefone: ongForm.telefone || undefined,
          latitude: parsed.latitude,
          longitude: parsed.longitude,
        });
      }

      updateUser({ ...user, ativo: true });
      toast({
        title: 'Perfil criado com sucesso',
        description: 'Agora sua conta aguarda validação.',
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
          {user.tipo_cadastro === 'idoso' && (
            <>
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Input
                  value={elderForm.endereco}
                  onChange={(e) => setElderForm((prev) => ({ ...prev, endereco: e.target.value }))}
                  placeholder="Rua, número, bairro"
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

          {user.tipo_cadastro === 'voluntario' && (
            <>
              <div className="space-y-2">
                <Label>Disponibilidade</Label>
                <Input
                  value={volunteerForm.disponibilidade}
                  onChange={(e) => setVolunteerForm((prev) => ({ ...prev, disponibilidade: e.target.value }))}
                  placeholder="Ex: Seg a Sex, 14h-18h"
                />
              </div>
              <div className="space-y-2">
                <Label>Área de atuação</Label>
                <Input
                  value={volunteerForm.area_atuacao}
                  onChange={(e) => setVolunteerForm((prev) => ({ ...prev, area_atuacao: e.target.value }))}
                  placeholder="Ex: Acompanhamento, visitas"
                />
              </div>
            </>
          )}

          {user.tipo_cadastro === 'ong' && (
            <>
              <div className="space-y-2">
                <Label>CNPJ</Label>
                <Input
                  value={ongForm.cnpj}
                  onChange={(e) => setOngForm((prev) => ({ ...prev, cnpj: e.target.value }))}
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div className="space-y-2">
                <Label>Responsável</Label>
                <Input
                  value={ongForm.responsavel}
                  onChange={(e) => setOngForm((prev) => ({ ...prev, responsavel: e.target.value }))}
                  placeholder="Nome do responsável"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone (opcional)</Label>
                <Input
                  value={ongForm.telefone}
                  onChange={(e) => setOngForm((prev) => ({ ...prev, telefone: e.target.value }))}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </>
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


