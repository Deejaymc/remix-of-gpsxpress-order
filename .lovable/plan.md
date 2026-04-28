# Plano: Verificação + Setup do Administrador

## Situação atual

- Edge function `setup-admin` **já existe** em `supabase/functions/setup-admin/index.ts` e está protegida por `ADMIN_SETUP_TOKEN`. Só cria admin se ainda não houver nenhum.
- Consulta à base confirma: **não existe nenhum admin** cadastrado ainda (`user_roles` vazia).
- Falta a interface para o usuário verificar o estado e criar o primeiro admin.

## O que será feito

### 1. Nova edge function `check-admin` (pública, só leitura)
- Retorna `{ exists: boolean, count: number }` indicando se já há algum admin na tabela `user_roles`.
- Usa `SERVICE_ROLE_KEY` internamente (não expõe dados sensíveis — apenas contagem).
- `verify_jwt = false` (precisa ser chamada antes de qualquer login).

### 2. Nova página `/setup` (pública)
Componente `src/pages/Setup.tsx` com dois estados:

**Estado A — Já existe admin**
- Mostra mensagem: "✓ Administrador já configurado no sistema."
- Botão "Ir para Login" → `/login`.
- Não permite criar outro (a edge function também bloqueia).

**Estado B — Nenhum admin ainda**
- Formulário com: E-mail, Senha (mín. 8), Confirmar senha, **Token de Setup** (`ADMIN_SETUP_TOKEN`).
- Ao submeter, chama `setup-admin` via `supabase.functions.invoke`.
- Em caso de sucesso: toast + redireciona para `/login`.

Mantém o estilo glassmorphism/dark futurista (igual à Login.tsx).

### 3. Rota e link de acesso
- Adicionar `<Route path="/setup" element={<Setup />} />` em `src/App.tsx` (pública, fora do `ProtectedRoute`).
- Pequeno link discreto na tela de Login: "Configurar primeiro administrador" → `/setup` (só visível quando faz sentido; aparece sempre, mas a página em si informa se já está configurado).

### 4. Secret necessário
- Se `ADMIN_SETUP_TOKEN` ainda não estiver definido no Cloud, vou solicitar ao usuário que cadastre (via tool `add_secret`) antes de usar a tela. Sem esse token a função retorna 403 por segurança.

## Arquivos afetados

- `supabase/functions/check-admin/index.ts` (novo)
- `src/pages/Setup.tsx` (novo)
- `src/App.tsx` (adiciona rota `/setup`)
- `src/pages/Login.tsx` (adiciona link discreto para `/setup`)

## Detalhes técnicos

- Input validado com regex de email e senha ≥ 8 no cliente; a edge function já revalida server-side.
- Não usamos `localStorage` para nada crítico (conforme regra do projeto).
- A edge function `setup-admin` existente **não será alterada** — já está correta e segura.
- Após a criação do admin, o login usa o fluxo padrão (`signInWithPassword`) que já existe.

Aprova para eu implementar?
