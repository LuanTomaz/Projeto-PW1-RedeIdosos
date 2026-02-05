import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  ShieldAlert,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  User,
  XCircle,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { companionshipsAPI, Companionship } from '@/lib/api';
import { cn } from '@/lib/utils';
import LocationPickerMap from '@/components/LocationPickerMap';

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pendente: { label: 'Pendente', color: 'status-pendente', icon: Clock },
  aceito: { label: 'Aceito', color: 'status-aceito', icon: CheckCircle2 },
  em_andamento: { label: 'Em Andamento', color: 'bg-blue-100 text-blue-700', icon: Clock },
  concluido: { label: 'ConcluÃ­do', color: 'status-concluido', icon: CheckCircle2 },
  cancelado: { label: 'Cancelado', color: 'status-cancelado', icon: XCircle },
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { error?: string } } }).response;
    if (response?.data?.error) return response.data.error;
  }
  return fallback;
};

export default function CompanionshipsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCompanionship, setSelectedCompanionship] = useState<Companionship | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [addressQuery, setAddressQuery] = useState('');
  const [addressResults, setAddressResults] = useState<Array<{ label: string; lat: number; lng: number }>>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [requestPhoto, setRequestPhoto] = useState<File | null>(null);
  const [createForm, setCreateForm] = useState({
    idoso_id: '',
    atividade: '',
    descricao: '',
    data: '',
    hora: '',
    local_descricao: '',
    latitude: '',
    longitude: '',
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const location = useLocation();
  const isMyActivities = location.pathname === '/dashboard/my-activities';

  const { data: companionships = [], isLoading } = useQuery({
    queryKey: ['companionships', user?.papel],
    queryFn: async () => {
      if (user?.papel === 'idoso') {
        return (await companionshipsAPI.getMine()).data;
      }
      return (await companionshipsAPI.getAll()).data;
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => companionshipsAPI.accept(id),
    onSuccess: () => {
      toast({ title: 'SolicitaÃ§Ã£o aceita com sucesso' });
      queryClient.invalidateQueries({ queryKey: ['companionships'] });
    },
    onError: (error: unknown) => {
      toast({
        title: 'NÃ£o foi possÃ­vel aceitar',
        description: getErrorMessage(error, 'Tente novamente'),
        variant: 'destructive',
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      companionshipsAPI.updateStatus(id, status),
    onSuccess: () => {
      toast({ title: 'Status atualizado com sucesso' });
      queryClient.invalidateQueries({ queryKey: ['companionships'] });
    },
    onError: (error: unknown) => {
      toast({
        title: 'NÃ£o foi possÃ­vel atualizar o status',
        description: getErrorMessage(error, 'Tente novamente'),
        variant: 'destructive',
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: () => {
      if (createForm.data) {
        const today = new Date();
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const chosen = new Date(createForm.data);
        if (chosen < todayDate) {
          return Promise.reject(new Error('A data deve ser hoje ou uma data futura'));
        }
      }
      const latitude = Number(createForm.latitude);
      const longitude = Number(createForm.longitude);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return Promise.reject(new Error('Latitude e longitude invÃ¡lidas'));
      }

      if (user?.papel !== 'idoso' && !createForm.idoso_id.trim()) {
        return Promise.reject(new Error('Informe o ID do idoso'));
      }

      return companionshipsAPI.create({
        idoso_id: user?.papel === 'idoso' ? undefined : createForm.idoso_id.trim(),
        atividade: createForm.atividade,
        descricao: createForm.descricao,
        data: createForm.data,
        hora: createForm.hora,
        local_descricao: createForm.local_descricao,
        latitude,
        longitude,
      }, requestPhoto ?? undefined);
    },
    onSuccess: () => {
      toast({ title: 'SolicitaÃ§Ã£o criada com sucesso' });
      queryClient.invalidateQueries({ queryKey: ['companionships'] });
      setIsCreateDialogOpen(false);
      setAddressQuery('');
      setAddressResults([]);
      setRequestPhoto(null);
      setCreateForm({
        idoso_id: '',
        atividade: '',
        descricao: '',
        data: '',
        hora: '',
        local_descricao: '',
        latitude: '',
        longitude: '',
      });
    },
    onError: (error: unknown) => {
      toast({
        title: 'NÃ£o foi possÃ­vel criar',
        description: getErrorMessage(error, 'Verifique os dados e tente novamente'),
        variant: 'destructive',
      });
    },
  });

  const filteredCompanionships = useMemo(() => {
    return companionships.filter((comp) => {
      const now = new Date();
      const [hoursRaw, minutesRaw] = comp.hora.split(':');
      const hours = Number(hoursRaw);
      const minutes = Number(minutesRaw ?? '0');
      const start = new Date(comp.data);
      if (Number.isFinite(hours) && Number.isFinite(minutes)) {
        start.setHours(hours, minutes, 0, 0);
      }
      const effectiveStatus =
        comp.status === 'aceito' && now >= start ? 'em_andamento' : comp.status;
      const elderName = comp.idoso?.usuario?.nome || '';
      const matchesSearch =
        elderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.atividade.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.local_descricao.toLowerCase().includes(searchQuery.toLowerCase());

      if (isMyActivities) {
        if (user?.papel !== 'voluntario') return false;
        const isAssigned = comp.voluntario?.usuario?.id === user.id;
        return matchesSearch && isAssigned && effectiveStatus === 'concluido';
      }

      const matchesStatus = statusFilter === 'all' || effectiveStatus === statusFilter;
      if (user?.papel === 'voluntario') {
        const isAssigned = comp.voluntario?.usuario?.id === user.id;
        const isPending = effectiveStatus === 'pendente';
        return matchesSearch && matchesStatus && (isPending || isAssigned);
      }
      return matchesSearch && matchesStatus;
    });
  }, [companionships, searchQuery, statusFilter, user?.id, user?.papel, isMyActivities]);

  const handleAccept = (comp: Companionship) => {
    acceptMutation.mutate(comp.id);
  };

  const handleComplete = (comp: Companionship) => {
    updateStatusMutation.mutate({ id: comp.id, status: 'concluido' });
  };

  const handleCancel = (comp: Companionship) => {
    updateStatusMutation.mutate({ id: comp.id, status: 'cancelado' });
  };

  const parsedLatitude = Number(createForm.latitude);
  const parsedLongitude = Number(createForm.longitude);
  const mapLatitude = Number.isFinite(parsedLatitude) ? parsedLatitude : undefined;
  const mapLongitude = Number.isFinite(parsedLongitude) ? parsedLongitude : undefined;

  const todayInputValue = (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  const searchAddress = async () => {
    const query = addressQuery.trim();
    if (!query) return;
    setIsSearchingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      if (!Array.isArray(data)) {
        setAddressResults([]);
        return;
      }
      const normalized = data
        .map((item: { display_name?: string; lat?: string; lon?: string }) => ({
          label: item.display_name ?? 'EndereÃ§o',
          lat: Number(item.lat),
          lng: Number(item.lon),
        }))
        .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng));
      setAddressResults(normalized);
    } catch {
      setAddressResults([]);
    } finally {
      setIsSearchingAddress(false);
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
          <h1 className="text-3xl font-display font-bold text-foreground">{isMyActivities ? 'Minhas Atividades' : 'Companhias'}</h1>
          <p className="mt-1 text-muted-foreground">{isMyActivities ? 'Atividades concluÃ­das por vocÃª' : 'Gerencie as solicitaÃ§Ãµes de companhia'}</p>
        </div>
        {!isMyActivities && (user?.papel === 'idoso' || user?.papel === 'ong' || user?.papel === 'admin') && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova SolicitaÃ§Ã£o
          </Button>
        )}
      </motion.div>

      {!isMyActivities && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4 md:grid-cols-5"
        >
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = companionships.filter((item) => {
              const now = new Date();
              const [hoursRaw, minutesRaw] = item.hora.split(':');
              const hours = Number(hoursRaw);
              const minutes = Number(minutesRaw ?? '0');
              const start = new Date(item.data);
              if (Number.isFinite(hours) && Number.isFinite(minutes)) {
                start.setHours(hours, minutes, 0, 0);
              }
              const effectiveStatus =
                item.status === 'aceito' && now >= start ? 'em_andamento' : item.status;
              return effectiveStatus === status;
            }).length;
            return (
              <Card
                key={status}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => setStatusFilter(status)}
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <div className={cn('rounded-full p-2', config.color.replace('text-', 'bg-').split(' ')[0])}>
                    <config.icon className={cn('h-5 w-5', config.color.split(' ')[1])} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por atividade, idoso ou local..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {!isMyActivities && (
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="aceito">Aceito</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluido">ConcluÃ­do</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        {isLoading && <p className="py-10 text-center text-muted-foreground">Carregando solicitaÃ§Ãµes...</p>}

        {!isLoading &&
          filteredCompanionships.map((comp, index) => {
            const now = new Date();
            const [hoursRaw, minutesRaw] = comp.hora.split(':');
            const hours = Number(hoursRaw);
            const minutes = Number(minutesRaw ?? '0');
            const start = new Date(comp.data);
            if (Number.isFinite(hours) && Number.isFinite(minutes)) {
              start.setHours(hours, minutes, 0, 0);
            }
            const effectiveStatus =
              comp.status === 'aceito' && now >= start ? 'em_andamento' : comp.status;
            const statusInfo = statusConfig[effectiveStatus];
            const elderName = comp.idoso?.usuario?.nome || 'Idoso';
            const volunteerName = comp.voluntario?.usuario?.nome;
            return (
              <motion.div
                key={comp.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="rounded-xl bg-primary/10 p-3">
                            <Calendar className="h-6 w-6 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-semibold">{comp.atividade}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">{comp.descricao}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{new Date(comp.data).toLocaleDateString('pt-BR')}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{comp.hora}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="max-w-[200px] truncate">{comp.local_descricao}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 lg:border-l lg:pl-4">
                        <div className="flex flex-col items-center gap-1">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={comp.idoso?.usuario?.foto_perfil_url} />
                            <AvatarFallback className="bg-teal-100 text-sm text-teal-700">
                              {elderName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">Idoso</span>
                        </div>

                        {volunteerName ? (
                          <div className="flex flex-col items-center gap-1">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={comp.voluntario?.usuario?.foto_perfil_url} />
                              <AvatarFallback className="bg-orange-100 text-sm text-orange-700">
                                {volunteerName
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">VoluntÃ¡rio</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30">
                              <User className="h-5 w-5 text-muted-foreground/50" />
                            </div>
                            <span className="text-xs text-muted-foreground">Aguardando</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 lg:border-l lg:pl-4">
                        <Badge className={cn('font-medium', statusInfo.color)}>
                          <statusInfo.icon className="mr-1 h-3 w-3" />
                          {statusInfo.label}
                        </Badge>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCompanionship(comp);
                                setIsDetailDialogOpen(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            {comp.status === 'pendente' && user?.papel === 'voluntario' && user.verificado && (
                              <DropdownMenuItem onClick={() => handleAccept(comp)}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Aceitar
                              </DropdownMenuItem>
                            )}
                            {comp.status === 'pendente' && user?.papel === 'voluntario' && !user.verificado && (
                              <DropdownMenuItem
                                onClick={() =>
                                  toast({
                                    title: 'VerificaÃ§Ã£o pendente',
                                    description:
                                      'Sua conta ainda nÃ£o foi verificada. VocÃª sÃ³ pode aceitar solicitaÃ§Ãµes apÃ³s a aprovaÃ§Ã£o do administrador.',
                                  })
                                }
                              >
                                <ShieldAlert className="mr-2 h-4 w-4 text-amber-600" />
                                Aceitar (aguardando verificaÃ§Ã£o)
                              </DropdownMenuItem>
                            )}
                            {(comp.status === 'aceito' || comp.status === 'em_andamento') && (
                              <DropdownMenuItem onClick={() => handleComplete(comp)}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Marcar como ConcluÃ­do
                              </DropdownMenuItem>
                            )}
                            {comp.status !== 'concluido' && comp.status !== 'cancelado' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={() => handleCancel(comp)}>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Cancelar
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

        {!isLoading && filteredCompanionships.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Nenhuma solicitaÃ§Ã£o encontrada</p>
          </div>
        )}
      </motion.div>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedCompanionship?.atividade}</DialogTitle>
            <DialogDescription>{selectedCompanionship?.descricao}</DialogDescription>
          </DialogHeader>

          {selectedCompanionship && (
            <div className="space-y-4">
              {(() => {
                const now = new Date();
                const [hoursRaw, minutesRaw] = selectedCompanionship.hora.split(':');
                const hours = Number(hoursRaw);
                const minutes = Number(minutesRaw ?? '0');
                const start = new Date(selectedCompanionship.data);
                if (Number.isFinite(hours) && Number.isFinite(minutes)) {
                  start.setHours(hours, minutes, 0, 0);
                }
                const effectiveStatus =
                  selectedCompanionship.status === 'aceito' && now >= start
                    ? 'em_andamento'
                    : selectedCompanionship.status;
                return (
                  <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium">
                    {new Date(selectedCompanionship.data).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">HorÃ¡rio</p>
                  <p className="font-medium">{selectedCompanionship.hora}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Local</p>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium">{selectedCompanionship.local_descricao}</p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {selectedCompanionship.latitude.toFixed(6)},{' '}
                      {selectedCompanionship.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Badge className={cn('font-medium', statusConfig[effectiveStatus].color)}>
                  {statusConfig[effectiveStatus].label}
                </Badge>
              </div>
                  </>
                );
              })()}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setAddressQuery('');
            setAddressResults([]);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova solicitaÃ§Ã£o</DialogTitle>
            <DialogDescription>Preencha os dados da atividade de companhia.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {user?.papel !== 'idoso' && (
              <div className="space-y-2">
                <Label>ID do idoso</Label>
                <Input
                  value={createForm.idoso_id}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, idoso_id: e.target.value }))}
                  placeholder="Ex: 65fa..."
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Atividade</Label>
              <Input
                value={createForm.atividade}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, atividade: e.target.value }))}
                placeholder="Ex: Caminhada no parque"
              />
            </div>

            <div className="space-y-2">
              <Label>DescriÃ§Ã£o</Label>
              <Textarea
                value={createForm.descricao}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, descricao: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={createForm.data}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, data: e.target.value }))}
                  min={todayInputValue}
                />
              </div>
              <div className="space-y-2">
                <Label>HorÃ¡rio</Label>
                <Input
                  type="time"
                  value={createForm.hora}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, hora: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Local (descriÃ§Ã£o)</Label>
              <Input
                value={createForm.local_descricao}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, local_descricao: e.target.value }))}
                placeholder="Ex: PraÃ§a central"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Latitude</Label>
                <Input
                  value={createForm.latitude}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, latitude: e.target.value }))}
                  placeholder="-23.5505"
                />
              </div>
              <div className="space-y-2">
                <Label>Longitude</Label>
                <Input
                  value={createForm.longitude}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, longitude: e.target.value }))}
                  placeholder="-46.6333"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Buscar endereÃ§o no mapa</Label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  placeholder="Digite um endereÃ§o ou ponto de referÃªncia"
                  value={addressQuery}
                  onChange={(e) => setAddressQuery(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={searchAddress}
                  disabled={isSearchingAddress}
                  className="sm:w-[180px]"
                >
                  {isSearchingAddress ? 'Buscando...' : 'Buscar'}
                </Button>
              </div>
              {addressResults.length > 0 && (
                <div className="rounded-lg border border-border p-2">
                  {addressResults.map((item, index) => (
                    <button
                      key={`${item.label}-${index}`}
                      type="button"
                      className="w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                      onClick={() => {
                        setCreateForm((prev) => ({
                          ...prev,
                          latitude: item.lat.toFixed(6),
                          longitude: item.lng.toFixed(6),
                          local_descricao: prev.local_descricao || item.label,
                        }));
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Selecione no mapa</Label>
              <p className="text-xs text-muted-foreground">
                Clique no mapa para preencher latitude e longitude automaticamente.
              </p>
              <LocationPickerMap
                latitude={mapLatitude}
                longitude={mapLongitude}
                onChange={(lat, lng) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    latitude: lat.toFixed(6),
                    longitude: lng.toFixed(6),
                  }))
                }
                height={220}
              />
            </div>

            <div className="space-y-2">
              <Label>Foto da solicitaÃ§Ã£o (opcional)</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setRequestPhoto(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Enviando...' : 'Criar solicitaÃ§Ã£o'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}




