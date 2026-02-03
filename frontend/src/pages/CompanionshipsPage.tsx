import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface MockCompanionship {
  id: string;
  idoso: { nome: string; foto?: string };
  voluntario?: { nome: string; foto?: string };
  atividade: string;
  descricao: string;
  data: string;
  hora: string;
  latitude: number;
  longitude: number;
  local_descricao: string;
  status: 'pendente' | 'aceito' | 'em_andamento' | 'concluido' | 'cancelado';
}

const mockCompanionships: MockCompanionship[] = [
  {
    id: '1',
    idoso: { nome: 'Maria Silva' },
    voluntario: { nome: 'João Santos' },
    atividade: 'Caminhada no parque',
    descricao: 'Caminhada leve de 30 minutos no parque',
    data: '2026-02-05',
    hora: '09:00',
    latitude: -23.550520,
    longitude: -46.633308,
    local_descricao: 'Parque Ibirapuera - Portão 3',
    status: 'aceito',
  },
  {
    id: '2',
    idoso: { nome: 'José Santos' },
    atividade: 'Ajuda com tecnologia',
    descricao: 'Preciso de ajuda para usar o celular',
    data: '2026-02-06',
    hora: '14:00',
    latitude: -23.561414,
    longitude: -46.656012,
    local_descricao: 'Residência do idoso',
    status: 'pendente',
  },
  {
    id: '3',
    idoso: { nome: 'Ana Costa' },
    voluntario: { nome: 'Carlos Lima' },
    atividade: 'Ida ao mercado',
    descricao: 'Acompanhar na ida ao supermercado',
    data: '2026-02-04',
    hora: '10:00',
    latitude: -23.553170,
    longitude: -46.658620,
    local_descricao: 'Supermercado Extra - Av. Paulista',
    status: 'concluido',
  },
  {
    id: '4',
    idoso: { nome: 'Pedro Oliveira' },
    atividade: 'Conversa',
    descricao: 'Apenas alguém para conversar',
    data: '2026-02-07',
    hora: '16:00',
    latitude: -23.562850,
    longitude: -46.669200,
    local_descricao: 'Praça da República',
    status: 'pendente',
  },
  {
    id: '5',
    idoso: { nome: 'Lucia Ferreira' },
    voluntario: { nome: 'Ana Costa' },
    atividade: 'Consulta médica',
    descricao: 'Acompanhar em consulta no hospital',
    data: '2026-02-03',
    hora: '08:00',
    latitude: -23.550000,
    longitude: -46.640000,
    local_descricao: 'Hospital das Clínicas',
    status: 'em_andamento',
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pendente: { label: 'Pendente', color: 'status-pendente', icon: Clock },
  aceito: { label: 'Aceito', color: 'status-aceito', icon: CheckCircle2 },
  em_andamento: { label: 'Em Andamento', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
  concluido: { label: 'Concluído', color: 'status-concluido', icon: CheckCircle2 },
  cancelado: { label: 'Cancelado', color: 'status-cancelado', icon: XCircle },
};

export default function CompanionshipsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCompanionship, setSelectedCompanionship] = useState<MockCompanionship | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const filteredCompanionships = mockCompanionships.filter((comp) => {
    const matchesSearch = 
      comp.idoso.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.atividade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.local_descricao.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || comp.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAccept = (comp: MockCompanionship) => {
    toast({
      title: 'Solicitação aceita!',
      description: `Você aceitou a solicitação de ${comp.idoso.nome}.`,
    });
  };

  const handleComplete = (comp: MockCompanionship) => {
    toast({
      title: 'Atividade concluída!',
      description: 'A atividade foi marcada como concluída.',
    });
  };

  const handleCancel = (comp: MockCompanionship) => {
    toast({
      title: 'Solicitação cancelada',
      description: 'A solicitação foi cancelada.',
      variant: 'destructive',
    });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Companhias</h1>
          <p className="text-muted-foreground mt-1">Gerencie as solicitações de companhia</p>
        </div>
        {(user?.papel === 'idoso' || user?.papel === 'ong') && (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova Solicitação
          </Button>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = mockCompanionships.filter(c => c.status === status).length;
          return (
            <Card key={status} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter(status)}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn('p-2 rounded-full', config.color.replace('text-', 'bg-').split(' ')[0])}>
                  <config.icon className={cn('w-5 h-5', config.color.split(' ')[1])} />
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

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por atividade, idoso ou local..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="aceito">Aceito</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Companionships List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        {filteredCompanionships.map((comp, index) => {
          const statusInfo = statusConfig[comp.status];
          return (
            <motion.div
              key={comp.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Activity Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-primary/10">
                          <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg">{comp.atividade}</h3>
                          <p className="text-muted-foreground text-sm mt-1">{comp.descricao}</p>
                          
                          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{new Date(comp.data).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>{comp.hora}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span className="truncate max-w-[200px]">{comp.local_descricao}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Participants */}
                    <div className="flex items-center gap-4 lg:border-l lg:pl-4">
                      <div className="flex flex-col items-center gap-1">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={comp.idoso.foto} />
                          <AvatarFallback className="bg-teal-100 text-teal-700 text-sm">
                            {comp.idoso.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">Idoso</span>
                      </div>
                      
                      {comp.voluntario ? (
                        <div className="flex flex-col items-center gap-1">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={comp.voluntario.foto} />
                            <AvatarFallback className="bg-orange-100 text-orange-700 text-sm">
                              {comp.voluntario.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">Voluntário</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-10 h-10 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                            <User className="w-5 h-5 text-muted-foreground/50" />
                          </div>
                          <span className="text-xs text-muted-foreground">Aguardando</span>
                        </div>
                      )}
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-3 lg:border-l lg:pl-4">
                      <Badge className={cn('font-medium', statusInfo.color)}>
                        <statusInfo.icon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedCompanionship(comp);
                            setIsDetailDialogOpen(true);
                          }}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          {comp.status === 'pendente' && user?.papel === 'voluntario' && (
                            <DropdownMenuItem onClick={() => handleAccept(comp)}>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Aceitar
                            </DropdownMenuItem>
                          )}
                          {(comp.status === 'aceito' || comp.status === 'em_andamento') && (
                            <DropdownMenuItem onClick={() => handleComplete(comp)}>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Marcar como Concluído
                            </DropdownMenuItem>
                          )}
                          {comp.status !== 'concluido' && comp.status !== 'cancelado' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleCancel(comp)}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
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

        {filteredCompanionships.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma solicitação encontrada</p>
          </div>
        )}
      </motion.div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedCompanionship?.atividade}</DialogTitle>
            <DialogDescription>{selectedCompanionship?.descricao}</DialogDescription>
          </DialogHeader>
          
          {selectedCompanionship && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium">{new Date(selectedCompanionship.data).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Horário</p>
                  <p className="font-medium">{selectedCompanionship.hora}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Local</p>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">{selectedCompanionship.local_descricao}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      {selectedCompanionship.latitude.toFixed(6)}, {selectedCompanionship.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Idoso</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-teal-100 text-teal-700 text-xs">
                        {selectedCompanionship.idoso.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-medium">{selectedCompanionship.idoso.nome}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Voluntário</p>
                  {selectedCompanionship.voluntario ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-orange-100 text-orange-700 text-xs">
                          {selectedCompanionship.voluntario.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-medium">{selectedCompanionship.voluntario.nome}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">Aguardando voluntário</p>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Badge className={cn('font-medium', statusConfig[selectedCompanionship.status].color)}>
                  {statusConfig[selectedCompanionship.status].label}
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
