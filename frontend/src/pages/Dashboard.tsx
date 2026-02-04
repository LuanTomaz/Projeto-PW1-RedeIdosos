import { motion } from 'framer-motion';
import { useQueries } from '@tanstack/react-query';
import {
  CalendarHeart,
  CheckCircle2,
  Clock,
  HandHeart,
  Star,
  UserCircle,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import {
  companionshipsAPI,
  eldersAPI,
  reviewsAPI,
  usersAPI,
  volunteersAPI,
} from '@/lib/api';

interface StatItem {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
}

export default function Dashboard() {
  const { user } = useAuth();

  const [usersQuery, eldersQuery, volunteersQuery, allCompQuery, myCompQuery, reviewsQuery] = useQueries({
    queries: [
      { queryKey: ['dashboard', 'users'], queryFn: async () => (await usersAPI.getAll()).data },
      { queryKey: ['dashboard', 'elders'], queryFn: async () => (await eldersAPI.getAll()).data },
      { queryKey: ['dashboard', 'volunteers'], queryFn: async () => (await volunteersAPI.getAll()).data },
      {
        queryKey: ['dashboard', 'companionships', 'all'],
        queryFn: async () => (await companionshipsAPI.getAll()).data,
      },
      {
        queryKey: ['dashboard', 'companionships', 'mine'],
        queryFn: async () => (await companionshipsAPI.getMine()).data,
      },
      { queryKey: ['dashboard', 'reviews'], queryFn: async () => (await reviewsAPI.getAll()).data },
    ],
  });

  if (!user) return null;

  const users = usersQuery.data ?? [];
  const elders = eldersQuery.data ?? [];
  const volunteers = volunteersQuery.data ?? [];
  const allCompanionships = allCompQuery.data ?? [];
  const myCompanionships = myCompQuery.data ?? [];
  const reviews = reviewsQuery.data ?? [];

  const isLoading =
    usersQuery.isLoading ||
    eldersQuery.isLoading ||
    volunteersQuery.isLoading ||
    allCompQuery.isLoading ||
    myCompQuery.isLoading ||
    reviewsQuery.isLoading;

  const volunteersPendingVerification = users.filter(
    (item) => item.papel === 'voluntario' && !item.verificado
  ).length;
  const volunteersVerified = users.filter(
    (item) => item.papel === 'voluntario' && item.verificado
  ).length;

  const completedCompanionships = allCompanionships.filter(
    (item) => item.status === 'concluido'
  ).length;
  const pendingCompanionships = allCompanionships.filter(
    (item) => item.status === 'pendente'
  ).length;

  const myCompletedCompanionships = myCompanionships.filter(
    (item) => item.status === 'concluido'
  ).length;
  const myPendingCompanionships = myCompanionships.filter(
    (item) => item.status === 'pendente'
  ).length;

  const averageReview =
    reviews.length > 0
      ? (reviews.reduce((acc, item) => acc + item.nota, 0) / reviews.length).toFixed(1)
      : '0.0';

  const statsByRole: Record<string, StatItem[]> = {
    admin: [
      { icon: Users, label: 'Total de Usuários', value: users.length, color: 'bg-blue-500' },
      { icon: UserCircle, label: 'Idosos Cadastrados', value: elders.length, color: 'bg-teal-500' },
      { icon: HandHeart, label: 'Voluntários Cadastrados', value: volunteers.length, color: 'bg-orange-500' },
      { icon: Clock, label: 'Companhias Pendentes', value: pendingCompanionships, color: 'bg-yellow-500' },
    ],
    gestor_publico: [
      { icon: CheckCircle2, label: 'Voluntários Verificados', value: volunteersVerified, color: 'bg-green-500' },
      { icon: Clock, label: 'Pendentes de Verificação', value: volunteersPendingVerification, color: 'bg-yellow-500' },
      { icon: CalendarHeart, label: 'Companhias Ativas', value: allCompanionships.length, color: 'bg-blue-500' },
      { icon: Star, label: 'Média de Avaliações', value: averageReview, color: 'bg-purple-500' },
    ],
    ong: [
      { icon: UserCircle, label: 'Idosos Cadastrados', value: elders.length, color: 'bg-teal-500' },
      { icon: HandHeart, label: 'Voluntários Disponíveis', value: volunteers.length, color: 'bg-orange-500' },
      { icon: Clock, label: 'Solicitações Pendentes', value: pendingCompanionships, color: 'bg-yellow-500' },
      { icon: CheckCircle2, label: 'Concluídas', value: completedCompanionships, color: 'bg-green-500' },
    ],
    voluntario: [
      { icon: CalendarHeart, label: 'Minhas Atividades', value: myCompanionships.length, color: 'bg-blue-500' },
      { icon: Clock, label: 'Pendentes', value: myPendingCompanionships, color: 'bg-yellow-500' },
      { icon: CheckCircle2, label: 'Concluídas', value: myCompletedCompanionships, color: 'bg-green-500' },
      { icon: Star, label: 'Média Geral', value: averageReview, color: 'bg-purple-500' },
    ],
    idoso: [
      { icon: CalendarHeart, label: 'Minhas Solicitações', value: myCompanionships.length, color: 'bg-blue-500' },
      { icon: Clock, label: 'Pendentes', value: myPendingCompanionships, color: 'bg-yellow-500' },
      { icon: CheckCircle2, label: 'Concluídas', value: myCompletedCompanionships, color: 'bg-green-500' },
      { icon: Star, label: 'Média Geral', value: averageReview, color: 'bg-purple-500' },
    ],
  };

  const stats = statsByRole[user.papel] ?? statsByRole.voluntario;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Olá, {user.nome.split(' ')[0]}!
          </h1>
          <p className="mt-1 text-muted-foreground">Resumo em tempo real da plataforma</p>
        </div>
      </motion.div>

      {isLoading ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Carregando dados do dashboard...
          </CardContent>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((item) => (
            <Card key={item.label} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-3xl font-display font-bold">{item.value}</p>
                  </div>
                  <div className={`rounded-xl p-3 text-white ${item.color}`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {allCompanionships.slice(0, 5).map((item) => (
            <div key={item.id} className="rounded-lg bg-muted/40 p-3">
              <p className="font-medium">{item.atividade}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(item.data).toLocaleDateString('pt-BR')} - {item.status}
              </p>
            </div>
          ))}
          {allCompanionships.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma atividade encontrada.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
