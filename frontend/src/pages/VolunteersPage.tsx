import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  MoreHorizontal,
  Edit,
  ShieldCheck,
  ShieldX,
  MapPin,
  Clock,
  Star,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Volunteer } from '@/lib/api';
import { cn } from '@/lib/utils';

// Mock data
interface MockVolunteer {
  id: string;
  usuario_id: string;
  disponibilidade?: string;
  latitude?: number;
  longitude?: number;
  usuario?: { nome: string; email: string; telefone?: string; foto_perfil_url?: string; verificado: boolean };
  stats?: { completedActivities: number; averageRating: number; hoursContributed: number };
}

const mockVolunteers: MockVolunteer[] = [
  {
    id: '1',
    usuario_id: 'u1',
    disponibilidade: 'Manhãs de segunda a sexta',
    latitude: -23.550520,
    longitude: -46.633308,
    usuario: { nome: 'João Santos', email: 'joao@email.com', telefone: '(11) 99999-1111', verificado: true },
    stats: { completedActivities: 45, averageRating: 4.9, hoursContributed: 156 }
  },
  {
    id: '2',
    usuario_id: 'u2',
    disponibilidade: 'Fins de semana',
    latitude: -23.561414,
    longitude: -46.656012,
    usuario: { nome: 'Ana Costa', email: 'ana@email.com', telefone: '(11) 99999-2222', verificado: false },
    stats: { completedActivities: 12, averageRating: 4.7, hoursContributed: 48 }
  },
  {
    id: '3',
    usuario_id: 'u3',
    disponibilidade: 'Tardes',
    latitude: -23.553170,
    longitude: -46.658620,
    usuario: { nome: 'Carlos Lima', email: 'carlos@email.com', telefone: '(11) 99999-3333', verificado: true },
    stats: { completedActivities: 78, averageRating: 5.0, hoursContributed: 290 }
  },
  {
    id: '4',
    usuario_id: 'u4',
    disponibilidade: 'Flexível',
    latitude: -23.562850,
    longitude: -46.669200,
    usuario: { nome: 'Lucia Ferreira', email: 'lucia@email.com', telefone: '(11) 99999-4444', verificado: true },
    stats: { completedActivities: 32, averageRating: 4.8, hoursContributed: 120 }
  },
  {
    id: '5',
    usuario_id: 'u5',
    disponibilidade: 'Noites',
    usuario: { nome: 'Roberto Alves', email: 'roberto@email.com', verificado: false },
    stats: { completedActivities: 5, averageRating: 4.5, hoursContributed: 15 }
  },
];

export default function VolunteersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVolunteer, setSelectedVolunteer] = useState<typeof mockVolunteers[0] | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredVolunteers = mockVolunteers.filter((volunteer) => {
    const matchesSearch = 
      volunteer.usuario?.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.usuario?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.disponibilidade?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const handleVerify = (volunteer: typeof mockVolunteers[0]) => {
    toast({
      title: 'Voluntário verificado',
      description: `${volunteer.usuario?.nome} foi verificado com sucesso.`,
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
          <h1 className="text-3xl font-display font-bold text-foreground">Voluntários</h1>
          <p className="text-muted-foreground mt-1">Gerencie os voluntários da plataforma</p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockVolunteers.filter(v => v.usuario?.verificado).length}</p>
              <p className="text-sm text-muted-foreground">Verificados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-yellow-100">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockVolunteers.filter(v => !v.usuario?.verificado).length}</p>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-orange-100">
              <Star className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">4.8</p>
              <p className="text-sm text-muted-foreground">Avaliação Média</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou disponibilidade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Volunteers Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredVolunteers.map((volunteer, index) => (
          <motion.div
            key={volunteer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
              setSelectedVolunteer(volunteer);
              setIsDetailDialogOpen(true);
            }}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={volunteer.usuario?.foto_perfil_url} />
                    <AvatarFallback className="bg-orange-100 text-orange-700 text-lg font-medium">
                      {volunteer.usuario?.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{volunteer.usuario?.nome}</h3>
                      {volunteer.usuario?.verificado ? (
                        <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <ShieldX className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{volunteer.usuario?.email}</p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </DropdownMenuItem>
                      {!volunteer.usuario?.verificado && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleVerify(volunteer);
                          }}>
                            <ShieldCheck className="w-4 h-4 mr-2" />
                            Verificar
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Stats */}
                {volunteer.stats && (
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-lg font-bold">{volunteer.stats.completedActivities}</p>
                      <p className="text-xs text-muted-foreground">Atividades</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-lg font-bold flex items-center justify-center gap-1">
                        {volunteer.stats.averageRating}
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      </p>
                      <p className="text-xs text-muted-foreground">Avaliação</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-lg font-bold">{volunteer.stats.hoursContributed}h</p>
                      <p className="text-xs text-muted-foreground">Horas</p>
                    </div>
                  </div>
                )}

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{volunteer.disponibilidade || 'Não informado'}</span>
                  </div>

                  {volunteer.latitude && volunteer.longitude && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Localização disponível</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Badge 
                    variant="secondary" 
                    className={volunteer.usuario?.verificado ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                  >
                    {volunteer.usuario?.verificado ? 'Verificado' : 'Pendente'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredVolunteers.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">Nenhum voluntário encontrado</p>
          </div>
        )}
      </motion.div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={selectedVolunteer?.usuario?.foto_perfil_url} />
                <AvatarFallback className="bg-orange-100 text-orange-700">
                  {selectedVolunteer?.usuario?.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  {selectedVolunteer?.usuario?.nome}
                  {selectedVolunteer?.usuario?.verificado ? (
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                  ) : (
                    <ShieldX className="w-4 h-4 text-yellow-600" />
                  )}
                </div>
                <p className="text-sm font-normal text-muted-foreground">Voluntário</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedVolunteer && (
            <div className="space-y-4">
              {/* Stats */}
              {selectedVolunteer.stats && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{selectedVolunteer.stats.completedActivities}</p>
                    <p className="text-xs text-muted-foreground">Atividades</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-center gap-1">
                      <p className="text-2xl font-bold">{selectedVolunteer.stats.averageRating}</p>
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    </div>
                    <p className="text-xs text-muted-foreground">Avaliação</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{selectedVolunteer.stats.hoursContributed}</p>
                    <p className="text-xs text-muted-foreground">Horas</p>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Contato</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <p>{selectedVolunteer.usuario?.email}</p>
                  </div>
                  {selectedVolunteer.usuario?.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <p>{selectedVolunteer.usuario.telefone}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Disponibilidade</p>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <p className="font-medium">{selectedVolunteer.disponibilidade || 'Não informado'}</p>
                </div>
              </div>

              {selectedVolunteer.latitude && selectedVolunteer.longitude && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Localização</p>
                  <p className="text-sm font-mono">
                    {selectedVolunteer.latitude.toFixed(6)}, {selectedVolunteer.longitude.toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Fechar
            </Button>
            {!selectedVolunteer?.usuario?.verificado && (
              <Button onClick={() => {
                if (selectedVolunteer) handleVerify(selectedVolunteer);
                setIsDetailDialogOpen(false);
              }}>
                <ShieldCheck className="w-4 h-4 mr-2" />
                Verificar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
