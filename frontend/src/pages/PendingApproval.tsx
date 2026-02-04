import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export default function PendingApproval() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Conta em validação</h1>
          <p className="mt-1 text-muted-foreground">
            Sua conta foi criada e está aguardando aprovação de um administrador.
          </p>
        </div>
        <ShieldCheck className="h-10 w-10 text-primary" />
      </motion.div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div>
            <p className="text-sm text-muted-foreground">Usuário</p>
            <p className="font-medium">{user.nome}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">E-mail</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium">Aguardando validação</p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Atualizar status
            </Button>
            <Button variant="ghost" onClick={logout}>
              Sair
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
