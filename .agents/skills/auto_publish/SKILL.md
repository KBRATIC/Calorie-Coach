---
name: Auto Publish
description: Após cada alteração de código feita pelo agente, automaticamente faz git add, commit e push para o repositório remoto. Ativada automaticamente em todas as interações.
---

## Regra de Auto-Publicação

Após **cada alteração de arquivo de código** (criar, editar ou deletar), o agente deve automaticamente:

1. Executar `git add .`
2. Gerar uma mensagem de commit no formato convencional (ex: `feat:`, `fix:`, `refactor:`, `style:`, `chore:`)
3. Executar `git commit -m "mensagem"`
4. Executar `git push`

### Regras importantes:
- **NÃO** perguntar ao usuário se deve commitar — faça automaticamente.
- **NÃO** acumular múltiplas alterações — commite após cada bloco de mudanças.
- Se o push falhar, informar o usuário.
- Mensagens de commit devem ser em inglês e descritivas.
- Respeitar a regra do AGENTS.md: nunca force push ou reescrever histórico.
