import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, User, MessageSquare, Calendar, ThumbsUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface MockReview {
  id: string;
  autor: { nome: string; foto?: string };
  destinatario: { nome: string; foto?: string };
  tipo: string;
  nota: number;
  comentario: string;
  data: string;
}

const mockReviews: MockReview[] = [
  {
    id: '1',
    autor: { nome: 'Maria Silva' },
    destinatario: { nome: 'João Santos' },
    tipo: 'idoso_para_voluntario',
    nota: 5,
    comentario: 'Excelente voluntário! Muito atencioso e paciente. Recomendo muito!',
    data: '2026-02-01',
  },
  {
    id: '2',
    autor: { nome: 'João Santos' },
    destinatario: { nome: 'Maria Silva' },
    tipo: 'voluntario_para_idoso',
    nota: 5,
    comentario: 'Dona Maria é uma pessoa muito agradável. Foi um prazer acompanhá-la.',
    data: '2026-02-01',
  },
  {
    id: '3',
    autor: { nome: 'Ana Costa' },
    destinatario: { nome: 'Carlos Lima' },
    tipo: 'idoso_para_voluntario',
    nota: 4,
    comentario: 'Muito bom voluntário, pontual e educado.',
    data: '2026-01-28',
  },
  {
    id: '4',
    autor: { nome: 'José Santos' },
    destinatario: { nome: 'Lucia Ferreira' },
    tipo: 'idoso_para_voluntario',
    nota: 5,
    comentario: 'Lucia é maravilhosa! Sempre alegre e prestativa.',
    data: '2026-01-25',
  },
];

function StarRating({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) {
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
          className={cn(
            'transition-colors',
            interactive && 'cursor-pointer hover:scale-110'
          )}
        >
          <Star
            className={cn(
              'w-6 h-6 transition-colors',
              (hovered || rating) >= star
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-muted-foreground'
            )}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [isNewReviewOpen, setIsNewReviewOpen] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmitReview = () => {
    if (newRating === 0) {
      toast({
        title: 'Selecione uma nota',
        description: 'Por favor, selecione uma nota de 1 a 5 estrelas.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Avaliação enviada!',
      description: 'Obrigado pelo seu feedback.',
    });
    setIsNewReviewOpen(false);
    setNewRating(0);
    setNewComment('');
  };

  // Calculate stats
  const averageRating = mockReviews.reduce((acc, r) => acc + r.nota, 0) / mockReviews.length;
  const ratingDistribution = [1, 2, 3, 4, 5].map(
    (stars) => mockReviews.filter((r) => r.nota === stars).length
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Avaliações</h1>
          <p className="text-muted-foreground mt-1">Veja e envie avaliações sobre as atividades</p>
        </div>
        <Dialog open={isNewReviewOpen} onOpenChange={setIsNewReviewOpen}>
          <DialogTrigger asChild>
            <Button>
              <Star className="w-4 h-4 mr-2" />
              Nova Avaliação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar Avaliação</DialogTitle>
              <DialogDescription>
                Avalie sua experiência com a atividade de companhia
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Sua nota</Label>
                <StarRating rating={newRating} onRate={setNewRating} interactive />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment">Comentário (opcional)</Label>
                <Textarea
                  id="comment"
                  placeholder="Conte como foi sua experiência..."
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
              <Button onClick={handleSubmitReview}>
                Enviar Avaliação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="md:col-span-1">
          <CardContent className="p-6 text-center">
            <div className="text-5xl font-bold text-primary mb-2">{averageRating.toFixed(1)}</div>
            <StarRating rating={Math.round(averageRating)} />
            <p className="text-sm text-muted-foreground mt-2">
              Baseado em {mockReviews.length} avaliações
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = ratingDistribution[stars - 1];
                const percentage = (count / mockReviews.length) * 100;
                return (
                  <div key={stars} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12">
                      <span className="text-sm font-medium">{stars}</span>
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    </div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reviews List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Avaliações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {mockReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="pb-6 border-b last:border-0 last:pb-0"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={review.autor.foto} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {review.autor.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="font-semibold">{review.autor.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            avaliou <span className="font-medium text-foreground">{review.destinatario.nome}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StarRating rating={review.nota} />
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.data).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>

                      {review.comentario && (
                        <p className="mt-3 text-muted-foreground">{review.comentario}</p>
                      )}

                      <div className="flex items-center gap-4 mt-3">
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          Útil
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
