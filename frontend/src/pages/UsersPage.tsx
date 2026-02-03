import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldX,
  UserCheck,
  UserX,
  Filter,
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
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { usersAPI, User } from '@/lib/api';
import { cn } from '@/lib/utils';

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  gestor_publico: 'Gestor Público',
  ong: 'ONG',
  voluntario: 'Voluntário',
  idoso: 'Idoso',
};

const roleColors: Record<string, string> = {
  admin: 'role-admin',
  gestor_publico: 'role-gestor',
  ong: 'role-ong',
  voluntario: 'role-voluntario',
  idoso: 'role-idoso',
};

// Mock data for demonstration
const mockUsers: User[] = [
  { id: '1', nome: 'Maria Silva', email: 'maria@email.com', papel: 'idoso', verificado: true, ativo: true, telefone: '(11) 99999-1111' },
  { id: '2', nome: 'João Santos', email: 'joao@email.com', papel: 'voluntario', verificado: true, ativo: true, telefone: '(11) 99999-2222' },
  { id: '3', nome: 'Ana Costa', email: 'ana@email.com', papel: 'voluntario', verificado: false, ativo: true, telefone: '(11) 99999-3333' },
  { id: '4', nome: 'Carlos Oliveira', email: 'carlos@email.com', papel: 'ong', verificado: true, ativo: true, telefone: '(11) 99999-4444' },
  { id: '5', nome: 'Fernanda Lima', email: 'fernanda@email.com', papel: 'gestor_publico', verificado: true, ativo: true, telefone: '(11) 99999-5555' },
  { id: '6', nome: 'Pedro Souza', email: 'pedro@email.com', papel: 'idoso', verificado: true, ativo: false, telefone: '(11) 99999-6666' },
  { id: '7', nome: 'Lucia Ferreira', email: 'lucia@email.com', papel: 'voluntario', verificado: true, ativo: true, telefone: '(11) 99999-7777' },
  { id: '8', nome: 'Roberto Almeida', email: 'roberto@email.com', papel: 'admin', verificado: true, ativo: true, telefone: '(11) 99999-8888' },
];

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  // Using mock data for now - replace with API call
  const users = mockUsers;

  const filteredUsers = users.filter((user) => {
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

  const handleStatusToggle = (user: User) => {
    toast({
      title: user.ativo ? 'Usuário desativado' : 'Usuário ativado',
      description: `${user.nome} foi ${user.ativo ? 'desativado' : 'ativado'} com sucesso.`,
    });
  };

  const handleVerify = (user: User) => {
    toast({
      title: 'Usuário verificado',
      description: `${user.nome} foi verificado com sucesso.`,
    });
  };

  const handleDelete = () => {
    if (selectedUser) {
      toast({
        title: 'Usuário excluído',
        description: `${selectedUser.nome} foi excluído com sucesso.`,
        variant: 'destructive',
      });
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Usuários</h1>
          <p className="text-muted-foreground mt-1">Gerencie todos os usuários da plataforma</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
                  <SelectItem value="all">Todos os papéis</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="gestor_publico">Gestor Público</SelectItem>
                  <SelectItem value="ong">ONG</SelectItem>
                  <SelectItem value="voluntario">Voluntário</SelectItem>
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

      {/* Users List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Lista de Usuários</CardTitle>
            <CardDescription>{filteredUsers.length} usuário(s) encontrado(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user.foto_perfil_url} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                      {user.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{user.nome}</p>
                      {user.verificado && (
                        <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  </div>

                  <div className="hidden sm:flex items-center gap-3">
                    <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', roleColors[user.papel])}>
                      {roleLabels[user.papel]}
                    </span>
                    <span className={cn(
                      'text-xs px-2.5 py-1 rounded-full font-medium',
                      user.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    )}>
                      {user.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      {!user.verificado && (
                        <DropdownMenuItem onClick={() => handleVerify(user)}>
                          <ShieldCheck className="w-4 h-4 mr-2" />
                          Verificar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleStatusToggle(user)}>
                        {user.ativo ? (
                          <>
                            <UserX className="w-4 h-4 mr-2" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4 mr-2" />
                            Ativar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Nenhum usuário encontrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o usuário <strong>{selectedUser?.nome}</strong>? 
              Esta ação não pode ser desfeita.
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
    </div>
  );
}
