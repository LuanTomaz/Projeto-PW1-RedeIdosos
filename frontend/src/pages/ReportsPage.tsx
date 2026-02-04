import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Report, reportsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { error?: string } } }).response;
    if (response?.data?.error) return response.data.error;
  }
  return fallback;
};

export default function ReportsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({
    tipo: '',
    descricao: '',
    data_inicio: '',
    data_fim: '',
  });

  const { data: myReports = [], isLoading: isLoadingMine } = useQuery({
    queryKey: ['reports', 'mine'],
    queryFn: async () => (await reportsAPI.getSummary()).data,
  });

  const { data: allReports = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ['reports', 'all'],
    queryFn: async () => (await reportsAPI.getStatistics()).data,
    enabled: user?.papel === 'admin',
  });

  const createReportMutation = useMutation({
    mutationFn: () =>
      reportsAPI.create({
        tipo: form.tipo,
        descricao: form.descricao || undefined,
        data_inicio: form.data_inicio || undefined,
        data_fim: form.data_fim || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast({ title: 'Relatório criado com sucesso' });
      setIsCreateOpen(false);
      setForm({ tipo: '', descricao: '', data_inicio: '', data_fim: '' });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Erro ao criar relatório',
        description: getErrorMessage(error, 'Verifique os dados e tente novamente'),
        variant: 'destructive',
      });
    },
  });

  const renderReportItem = (report: Report & { _id?: string }) => (
    <div key={report.id ?? report._id} className="rounded-xl border border-border p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold">{report.tipo}</p>
          {report.descricao && <p className="text-sm text-muted-foreground">{report.descricao}</p>}
        </div>
        <span className="text-xs text-muted-foreground">
          {report.gerado_em ? new Date(report.gerado_em).toLocaleDateString('pt-BR') : 'Sem data'}
        </span>
      </div>
      {(report.data_inicio || report.data_fim) && (
        <p className="mt-2 text-xs text-muted-foreground">
          Período: {report.data_inicio ? new Date(report.data_inicio).toLocaleDateString('pt-BR') : 'N/A'} –{' '}
          {report.data_fim ? new Date(report.data_fim).toLocaleDateString('pt-BR') : 'N/A'}
        </p>
      )}
    </div>
  );

  const combinedAll = useMemo(() => (Array.isArray(allReports) ? allReports : []), [allReports]);
  const combinedMine = useMemo(() => (Array.isArray(myReports) ? myReports : []), [myReports]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Relatórios</h1>
          <p className="mt-1 text-muted-foreground">Crie e consulte relatórios da plataforma</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo relatório
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Meus relatórios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingMine && <p className="text-sm text-muted-foreground">Carregando...</p>}
            {!isLoadingMine && combinedMine.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum relatório encontrado.</p>
            )}
            {!isLoadingMine && combinedMine.map(renderReportItem)}
          </CardContent>
        </Card>

        {(user?.papel === 'admin') && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Relatórios da plataforma</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingAll && <p className="text-sm text-muted-foreground">Carregando...</p>}
              {!isLoadingAll && combinedAll.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum relatório encontrado.</p>
              )}
              {!isLoadingAll && combinedAll.map(renderReportItem)}
            </CardContent>
          </Card>
        )}
      </motion.div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar relatório</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Input
                value={form.tipo}
                onChange={(e) => setForm((prev) => ({ ...prev, tipo: e.target.value }))}
                placeholder="Ex: impacto, estatísticas"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea
                value={form.descricao}
                onChange={(e) => setForm((prev) => ({ ...prev, descricao: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Data início</Label>
                <Input
                  type="date"
                  value={form.data_inicio}
                  onChange={(e) => setForm((prev) => ({ ...prev, data_inicio: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Data fim</Label>
                <Input
                  type="date"
                  value={form.data_fim}
                  onChange={(e) => setForm((prev) => ({ ...prev, data_fim: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => createReportMutation.mutate()} disabled={createReportMutation.isPending}>
              {createReportMutation.isPending ? 'Criando...' : 'Criar relatório'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



