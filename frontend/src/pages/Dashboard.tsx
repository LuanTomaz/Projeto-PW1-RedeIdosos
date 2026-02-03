import { motion } from 'framer-motion';
import { 
  Users, 
  UserCircle, 
  HandHeart, 
  CalendarHeart,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Star
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

// Mock data for demonstration
const mockStats = {
  admin: {
    totalUsers: 1250,
    activeElders: 320,
    activeVolunteers: 456,
    pendingCompanionships: 28,
    completedToday: 15,
  },
  gestor_publico: {
    verifiedVolunteers: 412,
    pendingVerifications: 12,
    activeCompanionships: 45,
    monthlyImpact: 890,
  },
  ong: {
    registeredElders: 85,
    assignedVolunteers: 32,
    pendingRequests: 8,
    completedThisMonth: 124,
  },
  voluntario: {
    completedActivities: 45,
    upcomingActivities: 3,
    averageRating: 4.8,
    hoursContributed: 156,
  },
  idoso: {
    totalRequests: 12,
    pendingRequests: 2,
    completedRequests: 10,
    averageRating: 4.9,
  },
};

const recentActivities = [
  { id: 1, type: 'companionship', description: 'Nova solicitação de companhia criada', time: '5 min atrás', status: 'pendente' },
  { id: 2, type: 'verification', description: 'Voluntário João Silva verificado', time: '1 hora atrás', status: 'aceito' },
  { id: 3, type: 'review', description: 'Nova avaliação recebida', time: '2 horas atrás', status: 'concluido' },
  { id: 4, type: 'companionship', description: 'Atividade concluída com sucesso', time: '3 horas atrás', status: 'concluido' },
];

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  const stats = mockStats[user.papel as keyof typeof mockStats] || mockStats.voluntario;

  const renderAdminDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          icon={Users}
          label="Total de Usuários"
          value={mockStats.admin.totalUsers}
          trend="+12%"
          color="bg-blue-500"
        />
        <StatsCard
          icon={UserCircle}
          label="Idosos Ativos"
          value={mockStats.admin.activeElders}
          trend="+8%"
          color="bg-teal-500"
        />
        <StatsCard
          icon={HandHeart}
          label="Voluntários Ativos"
          value={mockStats.admin.activeVolunteers}
          trend="+15%"
          color="bg-orange-500"
        />
        <StatsCard
          icon={CalendarHeart}
          label="Companhias Pendentes"
          value={mockStats.admin.pendingCompanionships}
          trend="-5%"
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivitiesCard activities={recentActivities} />
        <QuickActionsCard role="admin" />
      </div>
    </>
  );

  const renderGestorDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          icon={CheckCircle2}
          label="Voluntários Verificados"
          value={mockStats.gestor_publico.verifiedVolunteers}
          color="bg-green-500"
        />
        <StatsCard
          icon={Clock}
          label="Verificações Pendentes"
          value={mockStats.gestor_publico.pendingVerifications}
          color="bg-yellow-500"
        />
        <StatsCard
          icon={CalendarHeart}
          label="Companhias Ativas"
          value={mockStats.gestor_publico.activeCompanionships}
          color="bg-blue-500"
        />
        <StatsCard
          icon={TrendingUp}
          label="Impacto Mensal"
          value={mockStats.gestor_publico.monthlyImpact}
          trend="+20%"
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivitiesCard activities={recentActivities} />
        <QuickActionsCard role="gestor_publico" />
      </div>
    </>
  );

  const renderOngDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          icon={UserCircle}
          label="Idosos Cadastrados"
          value={mockStats.ong.registeredElders}
          color="bg-teal-500"
        />
        <StatsCard
          icon={HandHeart}
          label="Voluntários Vinculados"
          value={mockStats.ong.assignedVolunteers}
          color="bg-orange-500"
        />
        <StatsCard
          icon={Clock}
          label="Solicitações Pendentes"
          value={mockStats.ong.pendingRequests}
          color="bg-yellow-500"
        />
        <StatsCard
          icon={CheckCircle2}
          label="Concluídas (Mês)"
          value={mockStats.ong.completedThisMonth}
          trend="+18%"
          color="bg-green-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivitiesCard activities={recentActivities} />
        <QuickActionsCard role="ong" />
      </div>
    </>
  );

  const renderVoluntarioDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          icon={CheckCircle2}
          label="Atividades Concluídas"
          value={mockStats.voluntario.completedActivities}
          color="bg-green-500"
        />
        <StatsCard
          icon={CalendarHeart}
          label="Próximas Atividades"
          value={mockStats.voluntario.upcomingActivities}
          color="bg-blue-500"
        />
        <StatsCard
          icon={Star}
          label="Avaliação Média"
          value={mockStats.voluntario.averageRating}
          suffix="/5"
          color="bg-yellow-500"
        />
        <StatsCard
          icon={Clock}
          label="Horas Contribuídas"
          value={mockStats.voluntario.hoursContributed}
          suffix="h"
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Solicitações Próximas</CardTitle>
            <CardDescription>Atividades disponíveis na sua região</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="p-2 rounded-full bg-primary/10">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Caminhada no parque</p>
                    <p className="text-sm text-muted-foreground">2.5 km de distância</p>
                  </div>
                  <Button size="sm" variant="outline">Ver</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <QuickActionsCard role="voluntario" />
      </div>
    </>
  );

  const renderIdosoDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          icon={CalendarHeart}
          label="Solicitações Pendentes"
          value={mockStats.idoso.pendingRequests}
          color="bg-yellow-500"
        />
        <StatsCard
          icon={CheckCircle2}
          label="Atividades Concluídas"
          value={mockStats.idoso.completedRequests}
          color="bg-green-500"
        />
        <StatsCard
          icon={Star}
          label="Sua Avaliação"
          value={mockStats.idoso.averageRating}
          suffix="/5"
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Suas Solicitações</CardTitle>
            <CardDescription>Acompanhe suas atividades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockStats.idoso.pendingRequests > 0 ? (
                [1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div className={`p-2 rounded-full ${i === 1 ? 'bg-yellow-100' : 'bg-green-100'}`}>
                      {i === 1 ? (
                        <Clock className="w-5 h-5 text-yellow-600" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Companhia para caminhada</p>
                      <p className="text-sm text-muted-foreground">
                        {i === 1 ? 'Aguardando voluntário' : 'Amanhã às 10h'}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">Ver</Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma solicitação pendente
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <QuickActionsCard role="idoso" />
      </div>
    </>
  );

  const renderDashboardByRole = () => {
    switch (user.papel) {
      case 'admin':
        return renderAdminDashboard();
      case 'gestor_publico':
        return renderGestorDashboard();
      case 'ong':
        return renderOngDashboard();
      case 'voluntario':
        return renderVoluntarioDashboard();
      case 'idoso':
        return renderIdosoDashboard();
      default:
        return renderVoluntarioDashboard();
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Olá, {user.nome.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo(a) ao seu painel de controle
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {renderDashboardByRole()}
      </motion.div>
    </div>
  );
}

// Stats Card Component
interface StatsCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  trend?: string;
  suffix?: string;
  color: string;
}

function StatsCard({ icon: Icon, label, value, trend, suffix, color }: StatsCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-3xl font-display font-bold">
              {value}{suffix}
            </p>
            {trend && (
              <p className={`text-sm mt-1 ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {trend} este mês
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color} text-white`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Recent Activities Card
interface Activity {
  id: number;
  type: string;
  description: string;
  time: string;
  status: string;
}

function RecentActivitiesCard({ activities }: { activities: Activity[] }) {
  const statusColors: Record<string, string> = {
    pendente: 'status-pendente',
    aceito: 'status-aceito',
    concluido: 'status-concluido',
    cancelado: 'status-cancelado',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Atividades Recentes</CardTitle>
        <CardDescription>Últimas atualizações do sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4">
              <div className={`w-2 h-2 mt-2 rounded-full ${
                activity.status === 'pendente' ? 'bg-yellow-500' :
                activity.status === 'aceito' ? 'bg-green-500' :
                activity.status === 'concluido' ? 'bg-blue-500' : 'bg-gray-400'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.description}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${statusColors[activity.status]}`}>
                {activity.status}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Actions Card
function QuickActionsCard({ role }: { role: string }) {
  const actions: Record<string, Array<{ label: string; path: string; icon: React.ElementType }>> = {
    admin: [
      { label: 'Gerenciar Usuários', path: '/dashboard/users', icon: Users },
      { label: 'Ver Verificações', path: '/dashboard/verifications', icon: CheckCircle2 },
      { label: 'Relatórios', path: '/dashboard/reports', icon: TrendingUp },
    ],
    gestor_publico: [
      { label: 'Verificar Voluntários', path: '/dashboard/verifications', icon: CheckCircle2 },
      { label: 'Ver Mapa', path: '/dashboard/map', icon: MapPin },
      { label: 'Relatórios', path: '/dashboard/reports', icon: TrendingUp },
    ],
    ong: [
      { label: 'Cadastrar Idoso', path: '/dashboard/elders/new', icon: UserCircle },
      { label: 'Gerenciar Companhias', path: '/dashboard/companionships', icon: CalendarHeart },
      { label: 'Ver Mapa', path: '/dashboard/map', icon: MapPin },
    ],
    voluntario: [
      { label: 'Encontrar Atividades', path: '/dashboard/companionships', icon: CalendarHeart },
      { label: 'Minhas Atividades', path: '/dashboard/my-activities', icon: CheckCircle2 },
      { label: 'Ver Mapa', path: '/dashboard/map', icon: MapPin },
    ],
    idoso: [
      { label: 'Nova Solicitação', path: '/dashboard/new-request', icon: CalendarHeart },
      { label: 'Minhas Solicitações', path: '/dashboard/my-requests', icon: Clock },
      { label: 'Avaliar', path: '/dashboard/reviews', icon: Star },
    ],
  };

  const roleActions = actions[role] || actions.voluntario;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Ações Rápidas</CardTitle>
        <CardDescription>O que você gostaria de fazer?</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {roleActions.map((action) => (
            <Link key={action.path} to={action.path}>
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <action.icon className="w-5 h-5" />
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
