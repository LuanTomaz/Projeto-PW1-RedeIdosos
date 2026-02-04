import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Mail, Lock, User, Phone, ArrowRight, UserCircle, Building2, HandHeart, Users2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';

const registerSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmarSenha: z.string(),
  telefone: z.string().optional(),
  tipo_cadastro: z.enum(['voluntario', 'idoso', 'ong'] as const, {
    required_error: 'Selecione um tipo de conta',
  }),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const roleOptions = [
  {
    value: 'voluntario',
    label: 'Voluntário',
    description: 'Quero ajudar idosos',
    icon: HandHeart,
    color: 'bg-orange-100 text-orange-600 border-orange-200',
  },
  {
    value: 'idoso',
    label: 'Idoso',
    description: 'Preciso de companhia',
    icon: UserCircle,
    color: 'bg-teal-100 text-teal-600 border-teal-200',
  },
  {
    value: 'ong',
    label: 'ONG',
    description: 'Representar organização',
    icon: Building2,
    color: 'bg-green-100 text-green-600 border-green-200',
  },
];

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      tipo_cadastro: 'voluntario',
    },
  });

  const selectedRole = watch('tipo_cadastro');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    const success = await registerUser({
      nome: data.nome,
      email: data.email,
      senha: data.senha,
      tipo_cadastro: data.tipo_cadastro,
      telefone: data.telefone,
    });
    setIsLoading(false);
    
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
        
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-display font-bold text-white">
                Rede de Companhia
              </span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-display font-bold text-white mb-6 leading-tight">
              Junte-se à nossa<br />
              <span className="text-white/90">rede de cuidado</span>
            </h1>

            <p className="text-lg text-white/80 mb-8 max-w-md">
              Cadastre-se e faça parte de uma comunidade que valoriza 
              o respeito, a companhia e o bem-estar de todos.
            </p>

            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Users2, label: 'Voluntários' },
                { icon: UserCircle, label: 'Idosos' },
                { icon: Building2, label: 'ONGs' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center"
                >
                  <item.icon className="w-8 h-8 text-white mx-auto mb-2" />
                  <span className="text-sm text-white/80">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md py-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="p-2 hero-gradient rounded-xl">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">
              Rede de Companhia
            </span>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-display">Criar conta</CardTitle>
              <CardDescription>
                Preencha os dados abaixo para se cadastrar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Role Selection */}
                <div className="space-y-3">
                  <Label>Tipo de conta</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {roleOptions.map((role) => (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => setValue('tipo_cadastro', role.value as RegisterFormData['tipo_cadastro'])}
                        className={`
                          p-3 rounded-xl border-2 transition-all text-center
                          ${
                            selectedRole === role.value
                              ? `${role.color} border-current`
                              : 'bg-muted/50 border-transparent hover:border-muted-foreground/20'
                          }
                        `}
                      >
                        <role.icon className="w-6 h-6 mx-auto mb-1" />
                        <span className="text-xs font-medium block">{role.label}</span>
                      </button>
                    ))}
                  </div>
                  {errors.tipo_cadastro && (
                    <p className="text-sm text-destructive">{errors.tipo_cadastro.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="nome"
                      placeholder="Seu nome"
                      className="pl-10"
                      {...register('nome')}
                    />
                  </div>
                  {errors.nome && (
                    <p className="text-sm text-destructive">{errors.nome.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone (opcional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="telefone"
                      placeholder="(00) 00000-0000"
                      className="pl-10"
                      {...register('telefone')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="senha">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="senha"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        {...register('senha')}
                      />
                    </div>
                    {errors.senha && (
                      <p className="text-sm text-destructive">{errors.senha.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmarSenha">Confirmar</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="confirmarSenha"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        {...register('confirmarSenha')}
                      />
                    </div>
                    {errors.confirmarSenha && (
                      <p className="text-sm text-destructive">{errors.confirmarSenha.message}</p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Criando conta...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Criar conta
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Já tem uma conta?{' '}
                  <Link
                    to="/login"
                    className="text-primary font-medium hover:underline"
                  >
                    Entrar
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

