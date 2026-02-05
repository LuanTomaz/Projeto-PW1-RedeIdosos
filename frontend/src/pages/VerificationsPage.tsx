import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, FileText, MoreHorizontal, ShieldCheck, ShieldX, UserCheck, UserX } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { API_BASE_URL, filesAPI, User, usersAPI, verificationsAPI } from '@/lib/api';

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { error?: string } } }).response;
    if (response?.data?.error) return response.data.error;
  }
  return fallback;
};

export default function VerificationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userFiles, setUserFiles] = useState<Array<{ id: string; url_arquivo?: string; tipo_mime?: string }>>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['verifications', 'users'],
    queryFn: async () => (await usersAPI.getAll()).data,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => verificationsAPI.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verifications'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Usuário aprovado' });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Erro ao aprovar',
        description: getErrorMessage(error, 'Tente novamente'),
        variant: 'destructive',
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => verificationsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verifications'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Usuário bloqueado' });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Erro ao bloquear',
        description: getErrorMessage(error, 'Tente novamente'),
        variant: 'destructive',
      });
    },
  });

  const fetchDocsMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await filesAPI.getByEntity('user', userId);
      return Array.isArray(response.data) ? response.data : [];
    },
    onSuccess: (data) => {
      const normalized = data.map((item: { _id?: string; id?: string; url_arquivo?: string; tipo_mime?: string }) => ({
        id: item._id ?? item.id ?? '',
        url_arquivo: item.url_arquivo,
        tipo_mime: item.tipo_mime,
      }));
      setUserFiles(normalized.filter((item) => item.id));
    },
    onError: (error: unknown) => {
      toast({
        title: 'Erro ao carregar documentos',
        description: getErrorMessage(error, 'Tente novamente'),
        variant: 'destructive',
      });
    },
  });

  const openDocs = (user: User) => {
    setSelectedUser(user);
    setUserFiles([]);
    setIsDocsOpen(true);
    fetchDocsMutation.mutate(user.id);
  };

  const toAbsoluteUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return `${API_BASE_URL}${url}`;
    return `${API_BASE_URL}/${url}`;
  };

  const filtered = useMemo(() => {
    return users.filter((user: User) => {
      const matchesName = user.nome?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesEmail = user.email?.toLowerCase().includes(searchQuery.toLowerCase());
      return Boolean(matchesName || matchesEmail);
    });
  }, [users, searchQuery]);

  const pending = filtered.filter((user: User) => user.ativo && !user.verificado && !user.bloqueado);
  const verified = filtered.filter((user: User) => user.verificado && !user.bloqueado);
  const blocked = filtered.filter((user: User) => user.bloqueado);

  return (
    <>
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Verificações</h1>
          <p className="mt-1 text-muted-foreground">Aprove ou bloqueie usuários pendentes</p>
        </div>
      </motion.div>

      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2">
              <ShieldX className="h-5 w-5 text-yellow-600" />
              <h2 className="text-lg font-semibold">Pendentes ({pending.length})</h2>
            </div>

            {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
            {!isLoading && pending.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum usuário pendente.</p>
            )}

            {!isLoading &&
              pending.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.foto_perfil_url} />
                      <AvatarFallback className="bg-orange-100 text-orange-700">
                        {user.nome
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.nome}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openDocs(user)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Ver documentos
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => approveMutation.mutate(user.id)}>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Verificar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => rejectMutation.mutate(user.id)}>
                        <UserX className="mr-2 h-4 w-4" />
                        Bloquear
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold">Verificados ({verified.length})</h2>
            </div>

            {!isLoading &&
              verified.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-xl border border-border p-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.foto_perfil_url} />
                      <AvatarFallback className="bg-green-100 text-green-700">
                        {user.nome
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.nome}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              ))}

            {!isLoading && verified.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum usuário verificado ainda.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-red-600" />
              <h2 className="text-lg font-semibold">Bloqueados ({blocked.length})</h2>
            </div>

            {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
            {!isLoading && blocked.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum usuário bloqueado.</p>
            )}

            {!isLoading &&
              blocked.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-xl border border-border p-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.foto_perfil_url} />
                      <AvatarFallback className="bg-red-100 text-red-700">
                        {user.nome
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.nome}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <UserX className="h-5 w-5 text-red-600" />
                </div>
              ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>

      <Dialog open={isDocsOpen} onOpenChange={setIsDocsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Documentos do usuário</DialogTitle>
            <DialogDescription>
              {selectedUser ? `${selectedUser.nome} • ${selectedUser.email}` : 'Usuário selecionado'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div className="grid gap-3">
              <div>
                <p className="font-medium">RG</p>
                <p className="text-muted-foreground">{selectedUser?.rg || 'Não informado'}</p>
              </div>
              <div>
                <p className="font-medium">CPF</p>
                <p className="text-muted-foreground">{selectedUser?.cpf || 'Não informado'}</p>
              </div>
              <div>
                <p className="font-medium">Foto de perfil</p>
                {selectedUser?.foto_perfil_url ? (
                  <a
                    className="text-primary underline"
                    href={toAbsoluteUrl(selectedUser.foto_perfil_url)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver foto
                  </a>
                ) : (
                  <p className="text-muted-foreground">Não enviada</p>
                )}
              </div>
              <div>
                <p className="font-medium">Comprovante de residência</p>
                {selectedUser?.comprovante_residencia_url ? (
                  <a
                    className="text-primary underline"
                    href={toAbsoluteUrl(selectedUser.comprovante_residencia_url)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver comprovante
                  </a>
                ) : (
                  <p className="text-muted-foreground">Não enviado</p>
                )}
              </div>
            </div>

            <div>
              <p className="font-medium">Arquivos anexados</p>
              {fetchDocsMutation.isPending && <p className="text-muted-foreground">Carregando...</p>}
              {!fetchDocsMutation.isPending && userFiles.length === 0 && (
                <p className="text-muted-foreground">Nenhum arquivo anexado.</p>
              )}
              {!fetchDocsMutation.isPending && userFiles.length > 0 && (
                <ul className="space-y-1">
                  {userFiles.map((file) => (
                    <li key={file.id}>
                      <a
                        className="text-primary underline"
                        href={toAbsoluteUrl(file.url_arquivo)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {file.tipo_mime || 'Arquivo'} ({file.id.slice(-6)})
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDocsOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}










