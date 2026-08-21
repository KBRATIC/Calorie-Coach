import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeClosed } from "@phosphor-icons/react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — KcalTrack" },
      {
        name: "description",
        content: "Acesse sua conta KcalTrack para registrar calorias e acompanhar suas metas.",
      },
      { property: "og:title", content: "Entrar — KcalTrack" },
      {
        property: "og:description",
        content: "Acesse sua conta KcalTrack para registrar calorias e acompanhar suas metas.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/hoje", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/hoje", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("Não foi possível entrar", { description: error.message });
      return;
    }
    navigate({ to: "/hoje", replace: true });
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    if (!lgpdConsent) {
      toast.error("Termos não aceitos", { description: "Você precisa concordar com os Termos e Política de Privacidade para criar uma conta." });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: name },
      },
    });
    setLoading(false);
    if (error) {
      toast.error("Não foi possível criar a conta", { description: error.message });
      return;
    }
    if (!data.session) {
      toast.success("Confirme seu e-mail", {
        description: "Enviamos um link de confirmação para " + email,
      });
    }
  }

  async function google() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/hoje",
      }
    });
    if (error) {
      toast.error("Falha no login com Google");
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10 relative overflow-hidden">
      <div className="aurora-layer" aria-hidden />
      <Link
        to="/"
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" weight="bold" />
        Voltar ao início
      </Link>

      <div className="w-full max-w-md">
        <div className="w-full rounded-3xl bg-surface/40 backdrop-blur-xl border border-border/50 [box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] p-6 sm:p-10 relative z-10">
          <Link to="/" className="mb-8 flex items-center justify-center gap-2 group">
            <img
              src="/icon.png"
              alt="KcalTrack Logo"
              className="size-10 rounded-full object-cover transition-transform group-hover:scale-105 shadow-glow"
            />
            <span className="font-display tracking-tight font-bold text-2xl text-foreground">KcalTrack</span>
          </Link>

          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar conta</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-6">
              <form onSubmit={signIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-surface/50 border-border/50 rounded-xl h-11 px-4"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-surface/50 border-border/50 rounded-xl h-11 px-4 pr-12 [&::-ms-reveal]:hidden"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 size-9 text-muted-foreground hover:text-foreground hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <Eye className="size-5" /> : <EyeClosed className="size-5" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  Entrar
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form onSubmit={signUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    autoComplete="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="bg-surface/50 border-border/50 rounded-xl h-11 px-4"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-up">E-mail</Label>
                  <Input
                    id="email-up"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-surface/50 border-border/50 rounded-xl h-11 px-4"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-up">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password-up"
                      name="password"
                      type={showSignupPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-surface/50 border-border/50 rounded-xl h-11 px-4 pr-12 [&::-ms-reveal]:hidden"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 size-9 text-muted-foreground hover:text-foreground hover:bg-transparent"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                    >
                      {showSignupPassword ? <Eye className="size-5" /> : <EyeClosed className="size-5" />}
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 py-2">
                  <Checkbox 
                    id="lgpd-consent" 
                    checked={lgpdConsent} 
                    onCheckedChange={(c) => setLgpdConsent(c as boolean)} 
                    required 
                    className="mt-1"
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="lgpd-consent" className="text-sm font-medium leading-relaxed">
                      Concordo com os <Link to="/termos" className="text-primary hover:underline">Termos de Uso</Link> e <Link to="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link> e autorizo o tratamento de meus dados de saúde e biometria pelo aplicativo.
                    </Label>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  Criar conta
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            ou
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="secondary" className="w-full" onClick={google}>
            Continuar com Google
          </Button>
        </div>
      </div>
    </div>
  );
}
