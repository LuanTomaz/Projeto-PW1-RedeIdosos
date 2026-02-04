import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Mail, MapPin, MoreHorizontal, Phone, Search, UserCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ONG, ongsAPI } from '@/lib/api';

export default function OngsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOng, setSelectedOng] = useState<ONG | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const { data: ongs = [], isLoading } = useQuery({
    queryKey: ['ongs'],
    queryFn: async () => (await ongsAPI.getAll()).data,
  });

  const filteredOngs = useMemo(() => {
    return ongs.filter((ong) => {
      const matchesName = ong.nome?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCnpj = ong.cnpj?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesResponsavel = ong.responsavel?.toLowerCase().includes(searchQuery.toLowerCase());
      return Boolean(matchesName || matchesCnpj || matchesResponsavel);
    });
  }, [ongs, searchQuery]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">ONGs</h1>
          <p className="mt-1 text-muted-foreground">OrganizaÃ§Ãµes cadastradas na plataforma</p>
        </div>
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
                placeholder="Buscar por nome, CNPJ ou responsÃ¡vel..."
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
            Carregando ONGs...
          </div>
        )}

        {!isLoading &&
          filteredOngs.map((ong, index) => (
            <motion.div
              key={ong.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="cursor-pointer transition-shadow hover:shadow-lg"
                onClick={() => {
                  setSelectedOng(ong);
                  setIsDetailDialogOpen(true);
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={ong.foto_url} />
                      <AvatarFallback className="bg-green-100 text-lg font-medium text-green-700">
                        {ong.nome
                          ?.split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase() || 'ONG'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="truncate font-semibold">{ong.nome}</h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Building2 className="mr-2 h-4 w-4" />
                              Ver detalhes
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">CNPJ: {ong.cnpj}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{ong.responsavel}</span>
                    </div>
                    {typeof ong.latitude === 'number' && typeof ong.longitude === 'number' && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">LocalizaÃ§Ã£o disponÃ­vel</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

        {!isLoading && filteredOngs.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <p className="text-muted-foreground">Nenhuma ONG encontrada</p>
          </div>
        )}
      </motion.div>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={selectedOng?.foto_url} />
                <AvatarFallback className="bg-green-100 text-green-700">
                  {selectedOng?.nome
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() || 'ONG'}
                </AvatarFallback>
              </Avatar>
              {selectedOng?.nome}
            </DialogTitle>
          </DialogHeader>

          {selectedOng && (
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">CNPJ</p>
                <p className="font-medium">{selectedOng.cnpj}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">ResponsÃ¡vel</p>
                <p className="font-medium">{selectedOng.responsavel}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Contato</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p>{selectedOng.usuario?.email || 'NÃ£o informado'}</p>
                  </div>
                  {selectedOng.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p>{selectedOng.telefone}</p>
                    </div>
                  )}
                </div>
              </div>

              {typeof selectedOng.latitude === 'number' && typeof selectedOng.longitude === 'number' && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">LocalizaÃ§Ã£o</p>
                  <p className="font-mono text-sm">
                    {selectedOng.latitude.toFixed(6)}, {selectedOng.longitude.toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
