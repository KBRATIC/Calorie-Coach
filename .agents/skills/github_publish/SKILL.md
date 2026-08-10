---
name: Automate GitHub Commit and Push
description: Automatiza o processo de salvar alterações (git add, commit e push) no repositório. Use esta habilidade quando o usuário pedir para commitar, salvar no github ou publicar.
---

Quando o usuário solicitar que você faça o commit e publique/envie as alterações para o GitHub (ex: "faça o commit", "publique", "salve no github"), você deve:

1. Verificar se há alterações não 'commitadas' utilizando o comando `git status`.
2. Se houverem, solicitar ao usuário uma breve descrição (caso não tenha sido fornecida na mensagem atual) ou gerar uma mensagem de commit adequada baseada nas mudanças feitas, usando o formato convencional (ex: `feat: ...`, `fix: ...`).
3. Rodar o comando: `git add .` (ou adicionar arquivos específicos se solicitado).
4. Rodar o comando: `git commit -m "sua mensagem gerada"`
5. Rodar o comando: `git push` para publicar no repositório remoto.
6. Confirmar ao usuário que as alterações foram salvas e publicadas com sucesso.
