import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Heart,
  AlertCircle,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Elder } from '@/lib/api';

// Mock data
interface MockElder {
  id: string;
  usuario_id: string;
  endereco: string;
  latitude: number;
  longitude: number;
  data_nascimento: string;
  necessidades_especiais?: string;
  usuario?: { nome: string; email: string; telefone?: string; foto_perfil_url?: string };
}

const mockElders: MockElder[] = [
  {
    id: '1',
    usuario_id: 'u1',
    endereco: 'Rua das Flores, 123 - Centro',
    latitude: -23.550520,
    longitude: -46.633308,
    data_nascimento: '1945-05-15',
    necessidades_especiais: 'Dificuldade de locomoção',
    usuario: { nome: 'Maria Silva', email: 'maria@email.com', telefone: '(11) 99999-1111' }
  },
  {
    id: '2',
    usuario_id: 'u2',
    endereco: 'Av. Paulista, 1000 - Bela Vista',
    latitude: -23.561414,
    longitude: -46.656012,
    data_nascimento: '1940-08-22',
    usuario: { nome: 'José Santos', email: 'jose@email.com', telefone: '(11) 99999-2222' }
  },
  {
    id: '3',
    usuario_id: 'u3',
    endereco: 'Rua Augusta, 500 - Consolação',
    latitude: -23.553170,
    longitude: -46.658620,
    data_nascimento: '1938-12-03',
    necessidades_especiais: 'Deficiência auditiva leve',
    usuario: { nome: 'Ana Costa', email: 'ana@email.com', telefone: '(11) 99999-3333' }
  },
  {
    id: '4',
    usuario_id: 'u4',
    endereco: 'Rua Oscar Freire, 200 - Jardins',
    latitude: -23.562850,
    longitude: -46.669200,
    data_nascimento: '1950-03-10',
    usuario: { nome: 'Pedro Oliveira', email: 'pedro@email.com', telefone: '(11) 99999-4444' }
  },
];

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
  const [selectedElder, setSelectedElder] = useState<typeof mockElders[0] | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredElders = mockElders.filter((elder) => {
    const matchesSearch = 
      elder.usuario?.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      elder.endereco.toLowerCase().includes(searchQuery.toLowerCase()) ||
      elder.usuario?.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const handleDelete = () => {
    if (selectedElder) {
      toast({
        title: 'Idoso removido',
        description: `${selectedElder.usuario?.nome} foi removido com sucesso.`,
        variant: 'destructive',
      });
      setIsDeleteDialogOpen(false);
      setSelectedElder(null);
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
          <h1 className="text-3xl font-display font-bold text-foreground">Idosos</h1>
          <p className="text-muted-foreground mt-1">Gerencie os idosos cadastrados na plataforma</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Cadastrar Idoso
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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

      {/* Elders Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredElders.map((elder, index) => (
          <motion.div
            key={elder.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
              setSelectedElder(elder);
              setIsDetailDialogOpen(true);
            }}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={elder.usuario?.foto_perfil_url} />
                    <AvatarFallback className="bg-teal-100 text-teal-700 text-lg font-medium">
                      {elder.usuario?.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold truncate">{elder.usuario?.nome}</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
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
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className="text-sm text-muted-foreground mt-1">
                      {calculateAge(elder.data_nascimento)} anos
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground line-clamp-2">{elder.endereco}</span>
                  </div>

                  {elder.necessidades_especiais && (
                    <div className="flex items-start gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground line-clamp-1">{elder.necessidades_especiais}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t flex items-center gap-2">
                  <Badge variant="secondary" className="role-idoso">
                    <Heart className="w-3 h-3 mr-1" />
                    Idoso
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredElders.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">Nenhum idoso encontrado</p>
          </div>
        )}
      </motion.div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={selectedElder?.usuario?.foto_perfil_url} />
                <AvatarFallback className="bg-teal-100 text-teal-700">
                  {selectedElder?.usuario?.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
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
                  <MapPin className="w-4 h-4 text-primary mt-0.5" />
                  <p className="font-medium">{selectedElder.endereco}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Contato</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <p>{selectedElder.usuario?.email}</p>
                  </div>
                  {selectedElder.usuario?.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <p>{selectedElder.usuario.telefone}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedElder.necessidades_especiais && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Necessidades Especiais</p>
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 text-orange-700">
                    <AlertCircle className="w-4 h-4 mt-0.5" />
                    <p>{selectedElder.necessidades_especiais}</p>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Localização</p>
                <p className="text-sm font-mono">
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
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar remoção</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover <strong>{selectedElder?.usuario?.nome}</strong>? 
              Esta ação não pode ser desfeita.
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
