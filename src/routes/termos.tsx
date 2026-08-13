import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/termos")({
  component: TermosPage,
  head: () => ({
    meta: [
      { title: "Termos de Uso — KcalTrack" },
      { name: "description", content: "Termos de Uso do aplicativo KcalTrack." },
    ],
  }),
});

function TermosPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
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
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Termos de Uso</h1>
        </div>

        <div className="prose prose-invert prose-p:text-muted-foreground prose-headings:text-foreground prose-a:text-primary max-w-none space-y-6">
          <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          
          <section>
            <h2>1. Aceitação dos Termos</h2>
            <p>
              Ao criar uma conta e utilizar o KcalTrack, você concorda expressamente com os presentes Termos de Uso.
              Se você não concorda com qualquer parte destes termos, não deverá utilizar nossos serviços.
            </p>
          </section>

          <section className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 my-8">
            <h2 className="text-destructive mt-0">2. Isenção de Responsabilidade Médica (Aviso Importante)</h2>
            <p className="text-destructive/90 mb-0 font-medium">
              O KcalTrack é exclusivamente uma ferramenta de assistência de estilo de vida, bem-estar e registro alimentar. 
              <strong> AS INFORMAÇÕES, SUGESTÕES E AS ANÁLISES GERADAS PELA INTELIGÊNCIA ARTIFICIAL DO APLICATIVO NÃO SUBSTITUEM ACONSELHAMENTO, DIAGNÓSTICO OU TRATAMENTO MÉDICO OU NUTRICIONAL PROFISSIONAL.</strong>
              <br /><br />
              Sempre consulte um médico, nutricionista ou profissional de saúde qualificado antes de iniciar qualquer dieta, alterar seus hábitos alimentares ou tomar decisões baseadas nas estimativas de calorias e nutrientes fornecidas por este aplicativo. O KcalTrack e seus criadores não se responsabilizam por quaisquer danos, perdas ou problemas de saúde decorrentes do uso das informações aqui disponibilizadas.
            </p>
          </section>

          <section>
            <h2>3. Precisão das Informações</h2>
            <p>
              A inteligência artificial utilizada no KcalTrack (incluindo o reconhecimento de imagens e processamento de texto) realiza <strong>estimativas</strong> de calorias e porções com base em dados genéricos. Não garantimos a precisão, integridade ou exatidão absoluta dos dados nutricionais gerados. O usuário compreende que o aplicativo serve apenas como uma ferramenta de estimativa aproximada.
            </p>
          </section>

          <section>
            <h2>4. Uso da Conta e Responsabilidade</h2>
            <p>
              Você é responsável por manter a confidencialidade de suas credenciais de login e por todas as atividades que ocorram sob sua conta. Você se compromete a fornecer informações verdadeiras e atualizadas sobre você.
            </p>
          </section>

          <section>
            <h2>5. Modificações no Serviço e nos Termos</h2>
            <p>
              Reservamo-nos o direito de modificar ou descontinuar o aplicativo, bem como atualizar estes Termos de Uso a qualquer momento. Seu uso continuado do serviço após tais alterações constitui sua aceitação dos novos Termos.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
