import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Calendar,
  Edit,
  Heart,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Trash2,
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
import { useToast } from '@/hooks/use-toast';
import { Elder, eldersAPI } from '@/lib/api';

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { error?: string } } }).response;
    if (response?.data?.error) return response.data.error;
  }
  return fallback;
};

function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export default function EldersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedElder, setSelectedElder] = useState<Elder | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: elders = [], isLoading } = useQuery({
    queryKey: ['elders'],
    queryFn: async () => (await eldersAPI.getAll()).data,
  });

  const deleteElderMutation = useMutation({
    mutationFn: (id: string) => eldersAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elders'] });
      toast({ title: 'Idoso removido com sucesso' });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Erro ao remover idoso',
        description: getErrorMessage(error, 'Tente novamente'),
        variant: 'destructive',
      });
    },
  });

  const filteredElders = useMemo(() => {
    return elders.filter((elder) => {
      const matchesName = elder.usuario?.nome
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesAddress = elder.endereco.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesEmail = elder.usuario?.email
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      return Boolean(matchesName || matchesAddress || matchesEmail);
    });
  }, [elders, searchQuery]);

  const handleDelete = () => {
    if (!selectedElder) return;
    deleteElderMutation.mutate(selectedElder.id);
    setIsDeleteDialogOpen(false);
    setSelectedElder(null);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Idosos</h1>
          <p className="mt-1 text-muted-foreground">Gerencie os idosos cadastrados na plataforma</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Cadastrar Idoso
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou endereço..."
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
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {isLoading && (
          <div className="col-span-full py-10 text-center text-muted-foreground">
            Carregando idosos...
          </div>
        )}

        {!isLoading &&
          filteredElders.map((elder, index) => (
            <motion.div
              key={elder.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="cursor-pointer transition-shadow hover:shadow-lg"
                onClick={() => {
                  setSelectedElder(elder);
                  setIsDetailDialogOpen(true);
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={elder.usuario?.foto_perfil_url} />
                      <AvatarFallback className="bg-teal-100 text-lg font-medium text-teal-700">
                        {elder.usuario?.nome
                          ?.split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase() || 'ID'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="truncate font-semibold">{elder.usuario?.nome || 'Idoso'}</h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedElder(elder);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {calculateAge(elder.data_nascimento)} anos
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <span className="line-clamp-2 text-muted-foreground">{elder.endereco}</span>
                    </div>

                    {elder.necessidades_especiais && (
                      <div className="flex items-start gap-2 text-sm">
                        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500" />
                        <span className="line-clamp-1 text-muted-foreground">
                          {elder.necessidades_especiais}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-2 border-t pt-4">
                    <Badge variant="secondary" className="role-idoso">
                      <Heart className="mr-1 h-3 w-3" />
                      Idoso
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

        {!isLoading && filteredElders.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <p className="text-muted-foreground">Nenhum idoso encontrado</p>
          </div>
        )}
      </motion.div>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={selectedElder?.usuario?.foto_perfil_url} />
                <AvatarFallback className="bg-teal-100 text-teal-700">
                  {selectedElder?.usuario?.nome
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() || 'ID'}
                </AvatarFallback>
              </Avatar>
              {selectedElder?.usuario?.nome}
            </DialogTitle>
          </DialogHeader>

          {selectedElder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Idade</p>
                  <p className="font-medium">{calculateAge(selectedElder.data_nascimento)} anos</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Nascimento</p>
                  <p className="font-medium">
                    {new Date(selectedElder.data_nascimento).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Endereço</p>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                  <p className="font-medium">{selectedElder.endereco}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Contato</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p>{selectedElder.usuario?.email || 'Não informado'}</p>
                  </div>
                  {selectedElder.usuario?.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p>{selectedElder.usuario.telefone}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedElder.necessidades_especiais && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Necessidades Especiais</p>
                  <div className="flex items-start gap-2 rounded-lg bg-orange-50 p-3 text-orange-700">
                    <AlertCircle className="mt-0.5 h-4 w-4" />
                    <p>{selectedElder.necessidades_especiais}</p>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Localização</p>
                <p className="font-mono text-sm">
                  {selectedElder.latitude.toFixed(6)}, {selectedElder.longitude.toFixed(6)}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Fechar
            </Button>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar remoção</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover <strong>{selectedElder?.usuario?.nome}</strong>? Esta ação
              não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


