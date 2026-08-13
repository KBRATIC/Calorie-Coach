import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/privacidade")({
  component: PrivacidadePage,
  head: () => ({
    meta: [
      { title: "Política de Privacidade — KcalTrack" },
      { name: "description", content: "Política de Privacidade do aplicativo KcalTrack." },
    ],
  }),
});

function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 pt-8 pb-32 md:pb-12">
        <Link to="/" className="inline-block mb-8">
          <Button variant="ghost" className="gap-2 text-muted-foreground">
            <ArrowLeft className="size-4" />
            Voltar
          </Button>
        </Link>
        
        <div className="flex items-center gap-3 mb-10">
          <img 
            src="/icon.png" 
            alt="KcalTrack Logo" 
            className="size-12 rounded-2xl object-cover" 
          />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Política de Privacidade</h1>
        </div>

        <div className="prose prose-invert prose-p:text-muted-foreground prose-headings:text-foreground prose-a:text-primary max-w-none space-y-6">
          <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          
          <section>
            <h2>1. Coleta de Dados Sensíveis (Saúde e Biometria)</h2>
            <p>
              O KcalTrack coleta, mediante seu consentimento explícito, dados que podem ser considerados sensíveis pela Lei Geral de Proteção de Dados (LGPD), tais como:
              seu peso, altura, gênero, hábitos alimentares, histórico de consumo calórico e metas de peso. Estes dados são estritamente necessários para o funcionamento central do aplicativo, permitindo o cálculo de metabolismo basal, sugestões de refeições e rastreamento de progresso.
            </p>
          </section>

          <section>
            <h2>2. Uso da Inteligência Artificial</h2>
            <p>
              Utilizamos APIs de Inteligência Artificial de terceiros (como a API do Google Gemini) para processar textos e imagens que você envia para estimar calorias e criar registros alimentares.
              <strong> Nós não enviamos dados identificáveis (como seu nome, e-mail ou dados de contato) para a API de Inteligência Artificial.</strong> O texto enviado contém apenas descrições de alimentos e histórico calórico para geração de contexto. As políticas do nosso provedor (Google) garantem que os dados enviados via API não são utilizados para treinar seus modelos públicos.
            </p>
          </section>

          <section>
            <h2>3. Armazenamento e Segurança</h2>
            <p>
              Seus dados são armazenados de forma segura em infraestrutura na nuvem (Supabase), com criptografia em trânsito (HTTPS) e senhas protegidas com hashing forte. Implementamos medidas razoáveis para proteger suas informações contra acesso não autorizado.
            </p>
          </section>

          <section>
            <h2>4. Compartilhamento de Dados</h2>
            <p>
              Nós não vendemos, alugamos ou compartilhamos seus dados pessoais de saúde com anunciantes ou terceiros não essenciais. O compartilhamento ocorre apenas com os serviços de infraestrutura estritamente necessários para o funcionamento do app (provedor de banco de dados e API de IA, de forma anonimizada).
            </p>
          </section>

          <section>
            <h2>5. Direitos do Usuário (Exclusão de Dados)</h2>
            <p>
              De acordo com a LGPD, você tem o direito de acessar, corrigir e solicitar a exclusão total dos seus dados. Você pode excluir sua conta a qualquer momento acessando a aba <strong>Perfil (Configurações)</strong> dentro do aplicativo e clicando em <strong>Excluir Conta</strong>. Esta ação apagará permanentemente todos os seus registros alimentares, metas e informações de autenticação do nosso banco de dados, sem possibilidade de recuperação.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
