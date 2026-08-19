import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const Route = createFileRoute("/cookies")({
  component: CookiesPage,
  head: () => ({
    meta: [
      { title: "Política de Cookies — KcalTrack" },
      { name: "description", content: "Política de Cookies do aplicativo KcalTrack." },
    ],
  }),
});

function CookiesPage() {
  return (
    <LegalLayout title="Política de Cookies" lastUpdated={new Date().toLocaleDateString('pt-BR')}>
      <section>
        <h2>1. O que são Cookies?</h2>
        <p>
          Cookies são pequenos arquivos de texto armazenados no seu dispositivo (computador, tablet ou smartphone) pelo navegador quando você visita um site ou aplicativo da web. Eles são amplamente utilizados para fazer os sites funcionarem, ou funcionarem de forma mais eficiente, bem como para fornecer informações essenciais de estado e autenticação.
        </p>
      </section>

      <section>
        <h2>2. Como utilizamos os Cookies</h2>
        <p>
          O KcalTrack tem um compromisso forte com a sua privacidade. Portanto, <strong>nós não utilizamos cookies de rastreamento de terceiros, cookies de publicidade ou pixels de marketing</strong>. Nossa aplicação utiliza exclusivamente cookies e tecnologias semelhantes (como o LocalStorage do seu navegador) estritamente necessários para o funcionamento básico do sistema.
        </p>
      </section>

      <section>
        <h2>3. Tipos de Cookies que utilizamos</h2>
        
        <h3>Cookies Estritamente Necessários (Sessão e Autenticação)</h3>
        <p>
          Nós utilizamos a infraestrutura do Supabase para o banco de dados e autenticação de usuários. O Supabase utiliza cookies ou o LocalStorage do navegador de forma segura para:
        </p>
        <ul>
          <li>Manter você logado na sua conta com segurança através de tokens JWT (JSON Web Tokens).</li>
          <li>Lembrar do seu progresso e sessão enquanto você navega entre as páginas (ex: da página de Hoje para a página de Histórico).</li>
          <li>Proteger a aplicação contra ataques de falsificação de solicitações entre sites (CSRF).</li>
        </ul>

        <h3>Cookies de Preferências da Interface</h3>
        <p>
          Utilizamos o armazenamento local (LocalStorage) para lembrar suas escolhas na interface do usuário, para que você não precise configurá-las repetidamente:
        </p>
        <ul>
          <li><strong>Preferência de Tema:</strong> Se você selecionou o Modo Escuro ou Modo Claro (se aplicável).</li>
          <li><strong>Aceite de Cookies:</strong> Para registrar se você já clicou em "Aceitar" no nosso banner de cookies e ocultá-lo nas próximas visitas.</li>
        </ul>
      </section>

      <section>
        <h2>4. Posso desativar esses cookies?</h2>
        <p>
          Como os cookies que utilizamos são categorizados como <em>estritamente necessários</em> para o funcionamento seguro da aplicação, eles não podem ser desativados nos nossos sistemas. Você pode configurar seu navegador para bloquear ou alertar sobre esses cookies, mas neste caso, algumas partes do site (como fazer login e registrar alimentos) não funcionarão.
        </p>
      </section>

    </LegalLayout>
  );
}
