import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Star, ThumbsUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { reviewsAPI, usersAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

function StarRating({
  rating,
  onRate,
  interactive = false,
}: {
  rating: number;
  onRate?: (r: number) => void;
  interactive?: boolean;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={cn('transition-colors', interactive && 'cursor-pointer hover:scale-110')}
        >
          <Star
            className={cn(
              'h-6 w-6 transition-colors',
              (hovered || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
            )}
          />
        </button>
      ))}
    </div>
  );
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { error?: string } } }).response;
    if (response?.data?.error) return response.data.error;
  }
  return fallback;
};

export default function ReviewsPage() {
  const [isNewReviewOpen, setIsNewReviewOpen] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [reviewType, setReviewType] = useState<'voluntario' | 'idoso'>('voluntario');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => (await reviewsAPI.getAll()).data,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['reviews', 'users'],
    queryFn: async () => (await usersAPI.getAll()).data,
  });

  const recipients = useMemo(
    () => users.filter((item) => (reviewType === 'voluntario' ? item.papel === 'voluntario' : item.papel === 'idoso')),
    [users, reviewType]
  );

  const createReviewMutation = useMutation({
    mutationFn: () =>
      reviewsAPI.create({
        destinatario_id: targetUserId,
        tipo: reviewType,
        nota: newRating,
        comentario: newComment || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({ title: 'AvaliaÃ§Ã£o enviada com sucesso!' });
      setIsNewReviewOpen(false);
      setNewRating(0);
      setNewComment('');
      setTargetUserId('');
      setReviewType('voluntario');
    },
    onError: (error: unknown) => {
      toast({
        title: 'Erro ao enviar avaliaÃ§Ã£o',
        description: getErrorMessage(error, 'Confira os dados e tente novamente'),
        variant: 'destructive',
      });
    },
  });

  const handleSubmitReview = () => {
    if (!targetUserId.trim()) {
      toast({
        title: 'Informe o destinatÃ¡rio',
        description: 'Selecione o usuÃ¡rio avaliado.',
        variant: 'destructive',
      });
      return;
    }
    if (newRating === 0) {
      toast({
        title: 'Selecione uma nota',
        description: 'Escolha de 1 a 5 estrelas.',
        variant: 'destructive',
      });
      return;
    }
    createReviewMutation.mutate();
  };

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0 ? reviews.reduce((acc, item) => acc + item.nota, 0) / totalReviews : 0;
  const ratingDistribution = [1, 2, 3, 4, 5].map(
    (stars) => reviews.filter((item) => item.nota === stars).length
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">AvaliaÃ§Ãµes</h1>
          <p className="mt-1 text-muted-foreground">Veja e envie avaliaÃ§Ãµes sobre as atividades</p>
        </div>
        <Dialog open={isNewReviewOpen} onOpenChange={setIsNewReviewOpen}>
          <DialogTrigger asChild>
            <Button>
              <Star className="mr-2 h-4 w-4" />
              Nova AvaliaÃ§Ã£o
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar AvaliaÃ§Ã£o</DialogTitle>
              <DialogDescription>Avalie sua experiÃªncia com a atividade de companhia</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>UsuÃ¡rio avaliado</Label>
                <Select value={targetUserId} onValueChange={setTargetUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o usuÃ¡rio" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipients.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.nome} ({item.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo da avaliaÃ§Ã£o</Label>
                <Select
                  value={reviewType}
                  onValueChange={(value: 'voluntario' | 'idoso') => setReviewType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="voluntario">Avaliar voluntÃ¡rio</SelectItem>
                    <SelectItem value="idoso">Avaliar idoso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sua nota</Label>
                <StarRating rating={newRating} onRate={setNewRating} interactive />
              </div>
              <div className="space-y-2">
                <Label>ComentÃ¡rio (opcional)</Label>
                <Textarea
                  placeholder="Conte como foi sua experiÃªncia..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewReviewOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmitReview} disabled={createReviewMutation.isPending}>
                {createReviewMutation.isPending ? 'Enviando...' : 'Enviar AvaliaÃ§Ã£o'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        <Card className="md:col-span-1">
          <CardContent className="p-6 text-center">
            <div className="mb-2 text-5xl font-bold text-primary">{averageRating.toFixed(1)}</div>
            <StarRating rating={Math.round(averageRating)} />
            <p className="mt-2 text-sm text-muted-foreground">Baseado em {totalReviews} avaliaÃ§Ãµes</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = ratingDistribution[stars - 1];
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-3">
                    <div className="flex w-12 items-center gap-1">
                      <span className="text-sm font-medium">{stars}</span>
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-yellow-400 transition-all" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="w-8 text-sm text-muted-foreground">{count}</span>
                  </div>
                );
              })}
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
            <CardTitle className="font-display">AvaliaÃ§Ãµes Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="py-10 text-center text-muted-foreground">Carregando avaliaÃ§Ãµes...</p>
            ) : (
              <div className="space-y-6">
                {reviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b pb-6 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={review.autor?.foto_perfil_url} />
                        <AvatarFallback className="bg-primary/10 font-medium text-primary">
                          {(review.autor?.nome || 'AU')
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold">{review.autor?.nome || 'Autor'}</p>
                            <p className="text-sm text-muted-foreground">
                              avaliou{' '}
                              <span className="font-medium text-foreground">
                                {review.destinatario?.nome || 'DestinatÃ¡rio'}
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <StarRating rating={review.nota} />
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.data).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>

                        {review.comentario && <p className="mt-3 text-muted-foreground">{review.comentario}</p>}

                        <div className="mt-3 flex items-center gap-4">
                          <Button variant="ghost" size="sm" className="text-muted-foreground">
                            <ThumbsUp className="mr-1 h-4 w-4" />
                            Ãštil
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {reviews.length === 0 && (
                  <div className="py-10 text-center text-muted-foreground">
                    Nenhuma avaliaÃ§Ã£o encontrada.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
