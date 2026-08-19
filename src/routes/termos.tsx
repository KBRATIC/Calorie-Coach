import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/legal/LegalLayout";

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
    <LegalLayout title="Termos de Uso" lastUpdated={new Date().toLocaleDateString('pt-BR')}>
      <section>
        <h2>1. Aceitação dos Termos</h2>
        <p>
          Ao criar uma conta e utilizar o KcalTrack, você concorda expressamente com os presentes Termos de Uso.
          Se você não concorda com qualquer parte destes termos, não deverá utilizar nossos serviços.
        </p>
      </section>

      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 my-10 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive" />
        <h2 className="text-destructive mt-0 mb-4 border-none text-xl">2. Isenção de Responsabilidade Médica (Aviso Importante)</h2>
        <p className="text-destructive/90 mb-0 font-medium leading-relaxed">
          O KcalTrack é exclusivamente uma ferramenta de assistência de estilo de vida, bem-estar e registro alimentar. 
          <strong className="text-destructive block mt-2"> AS INFORMAÇÕES, SUGESTÕES E AS ANÁLISES GERADAS PELA INTELIGÊNCIA ARTIFICIAL DO APLICATIVO NÃO SUBSTITUEM ACONSELHAMENTO, DIAGNÓSTICO OU TRATAMENTO MÉDICO OU NUTRICIONAL PROFISSIONAL.</strong>
          <span className="block mt-4">
            Sempre consulte um médico, nutricionista ou profissional de saúde qualificado antes de iniciar qualquer dieta, alterar seus hábitos alimentares ou tomar decisões baseadas nas estimativas de calorias e nutrientes fornecidas por este aplicativo. O KcalTrack e seus criadores não se responsabilizam por quaisquer danos, perdas ou problemas de saúde decorrentes do uso das informações aqui disponibilizadas.
          </span>
        </p>
      </div>

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
    </LegalLayout>
  );
}
