import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { User, usersAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

const roleLabels: Record<string, string> = {
  pending: 'Pendente',
  admin: 'Administrador',
  ong: 'ONG',
  voluntario: 'VoluntÃ¡rio',
  idoso: 'Idoso',
};

const roleColors: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-700',
  admin: 'role-admin',
  ong: 'role-ong',
  voluntario: 'role-voluntario',
  idoso: 'role-idoso',
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { error?: string } } }).response;
    if (response?.data?.error) return response.data.error;
  }
  return fallback;
};

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    tipo_cadastro: 'voluntario',
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', roleFilter],
    queryFn: async () => {
      const response = await usersAPI.getAll(
        roleFilter === 'all' || roleFilter === 'pending' ? undefined : roleFilter
      );
      const data = response.data;
      return roleFilter === 'pending' ? data.filter((item) => item.papel === 'pending') : data;
    },
  });

  const verifyUserMutation = useMutation({
    mutationFn: (id: string) => usersAPI.validate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Usuário verificado com sucesso' });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Erro ao verificar usuário',
        description: getErrorMessage(error, 'Tente novamente'),
        variant: 'destructive',
      });
    },
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: (id: string) => usersAPI.updateStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Status do usuário atualizado' });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Erro ao atualizar status',
        description: getErrorMessage(error, 'Tente novamente'),
        variant: 'destructive',
      });
    },
  });

  const promoteAdminMutation = useMutation({
    mutationFn: (id: string) => usersAPI.updateRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'UsuÃ¡rio promovido a administrador' });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Erro ao promover administrador',
        description: getErrorMessage(error, 'Tente novamente'),
        variant: 'destructive',
      });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: () =>
      usersAPI.create({
        nome: createForm.nome,
        email: createForm.email,
        senha: createForm.senha,
        telefone: createForm.telefone || undefined,
        tipo_cadastro: createForm.tipo_cadastro as 'idoso' | 'voluntario' | 'ong',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Usuário criado com sucesso' });
      setIsCreateDialogOpen(false);
      setCreateForm({ nome: '', email: '', senha: '', telefone: '', tipo_cadastro: 'voluntario' });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Erro ao criar usuário',
        description: getErrorMessage(error, 'Verifique os dados e tente novamente'),
        variant: 'destructive',
      });
    },
  });

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === 'all' || user.papel === roleFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && user.ativo) ||
        (statusFilter === 'inactive' && !user.ativo);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await usersAPI.delete(selectedUser.id);
      toast({
        title: 'Usuário removido',
        description: `${selectedUser.nome} foi removido com sucesso.`,
      });
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error: unknown) {
      toast({
        title: 'Erro ao remover usuário',
        description: getErrorMessage(error, 'Tente novamente'),
        variant: 'destructive',
      });
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
          <h1 className="text-3xl font-display font-bold text-foreground">UsuÃ¡rios</h1>
          <p className="mt-1 text-muted-foreground">Gerencie todos os usuÃ¡rios da plataforma</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo UsuÃ¡rio
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrar por papel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os papÃ©is</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  
                  <SelectItem value="ong">ONG</SelectItem>
                  <SelectItem value="voluntario">VoluntÃ¡rio</SelectItem>
                  <SelectItem value="idoso">Idoso</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
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
          <CardHeader>
            <CardTitle className="font-display">Lista de UsuÃ¡rios</CardTitle>
            <CardDescription>{filteredUsers.length} usuÃ¡rio(s) encontrado(s)</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="py-10 text-center text-muted-foreground">Carregando usuÃ¡rios...</p>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 rounded-xl bg-muted/30 p-4 transition-colors hover:bg-muted/50"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.foto_perfil_url} />
                      <AvatarFallback className="bg-primary font-medium text-primary-foreground">
                        {user.nome
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{user.nome}</p>
                        {user.verificado && <ShieldCheck className="h-4 w-4 flex-shrink-0 text-green-600" />}
                      </div>
                      <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                    </div>

                    <div className="hidden items-center gap-3 sm:flex">
                      <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', roleColors[user.papel])}>
                        {roleLabels[user.papel]}
                      </span>
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-1 text-xs font-medium',
                          user.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        )}
                      >
                        {user.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        {!user.verificado && (
                          <DropdownMenuItem onClick={() => verifyUserMutation.mutate(user.id)}>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Verificar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => toggleUserStatusMutation.mutate(user.id)}>
                          {user.ativo ? (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Desativar
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Ativar
                            </>
                          )}
                        </DropdownMenuItem>
                        {currentUser?.papel === 'admin' && user.papel !== 'admin' && (
                          <DropdownMenuItem onClick={() => promoteAdminMutation.mutate(user.id)}>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Promover a admin
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                ))}

                {filteredUsers.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">Nenhum usuário encontrado</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o usuário <strong>{selectedUser?.nome}</strong>? Esta ação
              não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo usuário</DialogTitle>
            <DialogDescription>Preencha os dados para criar um novo usuário.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={createForm.nome}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, nome: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={createForm.telefone}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, telefone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <Input
                type="password"
                value={createForm.senha}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, senha: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de cadastro</Label>
              <Select
                value={createForm.tipo_cadastro}
                onValueChange={(value) =>
                  setCreateForm((prev) => ({ ...prev, tipo_cadastro: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="voluntario">VoluntÃ¡rio</SelectItem>
                  <SelectItem value="idoso">Idoso</SelectItem>
                  <SelectItem value="ong">ONG</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => createUserMutation.mutate()} disabled={createUserMutation.isPending}>
              {createUserMutation.isPending ? 'Criando...' : 'Criar usuÃ¡rio'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

