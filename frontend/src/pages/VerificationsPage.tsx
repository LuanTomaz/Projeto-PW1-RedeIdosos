import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, ShieldX, UserCheck, UserX } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { User, verificationsAPI } from '@/lib/api';

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { error?: string } } }).response;
    if (response?.data?.error) return response.data.error;
  }
  return fallback;
};

export default function VerificationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: volunteers = [], isLoading } = useQuery({
    queryKey: ['verifications', 'volunteers'],
    queryFn: async () => (await verificationsAPI.getAll()).data,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => verificationsAPI.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verifications'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Voluntário aprovado' });
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
      toast({ title: 'Voluntário bloqueado' });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Erro ao bloquear',
        description: getErrorMessage(error, 'Tente novamente'),
        variant: 'destructive',
      });
    },
  });

  const filtered = useMemo(() => {
    return volunteers.filter((user: User) => {
      const matchesName = user.nome?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesEmail = user.email?.toLowerCase().includes(searchQuery.toLowerCase());
      return Boolean(matchesName || matchesEmail);
    });
  }, [volunteers, searchQuery]);

  const pending = filtered.filter((user: User) => !user.verificado);
  const verified = filtered.filter((user: User) => user.verificado);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">VerificaÃ§Ãµes</h1>
          <p className="mt-1 text-muted-foreground">Aprove ou bloqueie voluntÃ¡rios pendentes</p>
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
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2">
              <ShieldX className="h-5 w-5 text-yellow-600" />
              <h2 className="text-lg font-semibold">Pendentes ({pending.length})</h2>
            </div>

            {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
            {!isLoading && pending.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum voluntário pendente.</p>
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
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => approveMutation.mutate(user.id)}>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Aprovar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => rejectMutation.mutate(user.id)}>
                      <UserX className="mr-2 h-4 w-4" />
                      Bloquear
                    </Button>
                  </div>
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
              <p className="text-sm text-muted-foreground">Nenhum voluntário verificado ainda.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
