import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  Clock,
  Edit,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Search,
  ShieldCheck,
  ShieldX,
  Star,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
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
import { useToast } from '@/hooks/use-toast';
import { usersAPI, Volunteer, volunteersAPI } from '@/lib/api';

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { error?: string } } }).response;
    if (response?.data?.error) return response.data.error;
  }
  return fallback;
};

export default function VolunteersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: volunteers = [], isLoading } = useQuery({
    queryKey: ['volunteers'],
    queryFn: async () => (await volunteersAPI.getAll()).data,
  });

  const verifyVolunteerMutation = useMutation({
    mutationFn: (userId: string) => usersAPI.validate(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Voluntário verificado com sucesso' });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Erro ao verificar voluntário',
        description: getErrorMessage(error, 'Tente novamente'),
        variant: 'destructive',
      });
    },
  });

  const filteredVolunteers = useMemo(() => {
    return volunteers.filter((volunteer) => {
      const matchesName = volunteer.usuario?.nome
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesEmail = volunteer.usuario?.email
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesAvailability = volunteer.disponibilidade
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      return Boolean(matchesName || matchesEmail || matchesAvailability);
    });
  }, [volunteers, searchQuery]);

  const verifiedCount = volunteers.filter((v) => v.usuario?.verificado).length;
  const pendingCount = volunteers.length - verifiedCount;

  const handleVerify = (volunteer: Volunteer) => {
    if (!volunteer.usuario_id) {
      toast({
        title: 'Não foi possível verificar',
        description: 'Voluntário sem usuário associado.',
        variant: 'destructive',
      });
      return;
    }
    verifyVolunteerMutation.mutate(volunteer.usuario_id);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Voluntários</h1>
          <p className="mt-1 text-muted-foreground">Gerencie os voluntários da plataforma</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{verifiedCount}</p>
              <p className="text-sm text-muted-foreground">Verificados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-yellow-100 p-3">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-orange-100 p-3">
              <Star className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">-</p>
              <p className="text-sm text-muted-foreground">Avaliação Média</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {isLoading && (
          <div className="col-span-full py-10 text-center text-muted-foreground">
            Carregando voluntários...
          </div>
        )}

        {!isLoading &&
          filteredVolunteers.map((volunteer, index) => (
            <motion.div
              key={volunteer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="cursor-pointer transition-shadow hover:shadow-lg"
                onClick={() => {
                  setSelectedVolunteer(volunteer);
                  setIsDetailDialogOpen(true);
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={volunteer.usuario?.foto_perfil_url} />
                      <AvatarFallback className="bg-orange-100 text-lg font-medium text-orange-700">
                        {volunteer.usuario?.nome
                          ?.split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase() || 'VO'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-semibold">{volunteer.usuario?.nome || 'Voluntário'}</h3>
                        {volunteer.usuario?.verificado ? (
                          <ShieldCheck className="h-4 w-4 flex-shrink-0 text-green-600" />
                        ) : (
                          <ShieldX className="h-4 w-4 flex-shrink-0 text-yellow-600" />
                        )}
                      </div>
                      <p className="truncate text-sm text-muted-foreground">{volunteer.usuario?.email}</p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        {!volunteer.usuario?.verificado && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVerify(volunteer);
                              }}
                            >
                              <ShieldCheck className="mr-2 h-4 w-4" />
                              Verificar
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {volunteer.disponibilidade || 'Não informado'}
                      </span>
                    </div>

                    {typeof volunteer.latitude === 'number' && typeof volunteer.longitude === 'number' && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Localização disponível</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 border-t pt-4">
                    <Badge
                      variant="secondary"
                      className={
                        volunteer.usuario?.verificado
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }
                    >
                      {volunteer.usuario?.verificado ? 'Verificado' : 'Pendente'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

        {!isLoading && filteredVolunteers.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <p className="text-muted-foreground">Nenhum voluntário encontrado</p>
          </div>
        )}
      </motion.div>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={selectedVolunteer?.usuario?.foto_perfil_url} />
                <AvatarFallback className="bg-orange-100 text-orange-700">
                  {selectedVolunteer?.usuario?.nome
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() || 'VO'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  {selectedVolunteer?.usuario?.nome}
                  {selectedVolunteer?.usuario?.verificado ? (
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                  ) : (
                    <ShieldX className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
                <p className="text-sm font-normal text-muted-foreground">Voluntário</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedVolunteer && (
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Contato</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p>{selectedVolunteer.usuario?.email || 'Não informado'}</p>
                  </div>
                  {selectedVolunteer.usuario?.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p>{selectedVolunteer.usuario.telefone}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Disponibilidade</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <p className="font-medium">{selectedVolunteer.disponibilidade || 'Não informado'}</p>
                </div>
              </div>

              {typeof selectedVolunteer.latitude === 'number' &&
                typeof selectedVolunteer.longitude === 'number' && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Localização</p>
                    <p className="font-mono text-sm">
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
              <Button
                onClick={() => {
                  if (selectedVolunteer) handleVerify(selectedVolunteer);
                  setIsDetailDialogOpen(false);
                }}
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Verificar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

