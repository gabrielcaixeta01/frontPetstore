# Apex Petstore — Frontend

Documentação técnica completa do projeto frontend. Para qualquer pessoa que precise entender como o código está organizado, o que cada arquivo faz e como as peças se conectam.

---

## Stack

| Tecnologia | Versão | Papel |
|---|---|---|
| React | 19 | Biblioteca de componentes e hooks |
| TypeScript | 5.9 | Tipagem estática |
| React Router DOM | 7 | Roteamento SPA |
| Vite | 8 | Build tool e servidor de desenvolvimento |
| Tailwind CSS | 4 | Estilização utilitária |
| Axios | 1.14 | HTTP client com interceptors |
| Lucide React | — | Biblioteca de ícones |

---

## Estrutura de pastas

```
src/
├── App.tsx                         # Raiz do roteamento — decide qual shell renderizar
├── main.tsx                        # Entrypoint React (ReactDOM.createRoot)
├── index.css                       # Estilos globais
│
├── services/                       # Camada de comunicação com a API
│   ├── api.ts                      # Instância axios com interceptor de token
│   ├── petService.ts
│   ├── atendimentoService.ts
│   ├── categoriaService.ts
│   ├── servicoService.ts
│   ├── tagService.ts
│   ├── lojaService.ts
│   ├── usuarioService.ts
│   ├── clienteService.ts
│   └── funcionarioService.ts
│
├── types/                          # Interfaces TypeScript
│   ├── pet.ts
│   ├── atendimento.ts
│   ├── categoria.ts
│   ├── servico.ts
│   ├── tag.ts
│   ├── loja.ts
│   ├── usuario.ts
│   ├── cliente.ts
│   ├── funcionario.ts
│   └── auth.ts
│
├── components/                     # Componentes reutilizáveis
│   ├── Navbar.tsx                  # Navegação pública (top bar)
│   ├── EditModal.tsx               # Wrapper genérico de modal de edição
│   ├── cliente/
│   │   ├── ClienteLayout.tsx       # Sidebar do cliente
│   │   └── NavCliente.tsx          # Itens de navegação do cliente
│   └── funcionario/
│       ├── FuncionarioLayout.tsx   # Sidebar do funcionário
│       └── NavFuncionario.tsx      # Itens de navegação do funcionário
│
├── pages/                          # Páginas (uma por rota)
│   ├── Home.tsx                    # Landing page pública
│   ├── LoginPage.tsx               # Login
│   ├── RegisterPage.tsx            # Cadastro
│   ├── cliente/                    # Páginas do cliente autenticado
│   │   ├── Home.tsx
│   │   ├── PetsPage.tsx
│   │   ├── AtendimentosPage.tsx
│   │   ├── ServicosPage.tsx
│   │   ├── CategoriasPage.tsx
│   │   ├── TagsPage.tsx
│   │   ├── LojasPage.tsx
│   │   ├── LojaPage.tsx
│   │   └── ProfilePage.tsx
│   └── funcionario/                # Páginas do funcionário autenticado
│       ├── Home.tsx
│       ├── PetsPage.tsx
│       ├── AtendimentosPage.tsx
│       ├── ServicosPage.tsx
│       ├── CategoriasPage.tsx
│       ├── TagsPage.tsx
│       ├── LojasPage.tsx
│       ├── LojaPage.tsx
│       ├── UsersPage.tsx
│       └── ProfilePage.tsx
│
└── lib/
    └── theme.ts                    # Cores legadas (não usar em páginas novas)
```

---

## Como o roteamento funciona (`App.tsx`)

O `App.tsx` é o coração do sistema de navegação. A cada mudança de rota, ele lê o `localStorage` e decide qual "shell" renderizar:

```
Sem token          → PublicShell     → Navbar no topo  → rotas: /, /login, /register
token + cliente    → ClienteShell    → Sidebar lateral  → rotas: /cliente/*
token + funcionario → FuncionarioShell → Sidebar lateral → rotas: /funcionario/*
```

A detecção de papel (`role`) é defensiva — verifica três campos possíveis do objeto de usuário:

```ts
user.profile_type ?? user.role ?? user.tipo_perfil
```

Isso garante compatibilidade com variações na resposta do backend.

---

## Autenticação

### Fluxo de login / registro

1. Usuário submete o formulário em `LoginPage` ou `RegisterPage`
2. O frontend chama `POST /auth/login` ou `POST /auth/register`
3. O backend retorna `{ access_token, user }` onde `user.profile_type` define o papel
4. Dois valores são salvos no `localStorage`:
   - `token` — JWT usado em todas as requisições
   - `user` — objeto JSON com id, nome, email, profile_type etc.
5. O `AppShell` re-detecta o papel e redireciona para o shell correto

### Logout

Apaga `token` e `user` do `localStorage` e redireciona para `/login`.

### Interceptor de token (`services/api.ts`)

```ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

Toda requisição feita via `api` já inclui o token automaticamente — os serviços não precisam fazer nada.

---

## Camada de serviços (`src/services/`)

Cada entidade tem um arquivo de serviço dedicado. Os serviços fazem duas coisas:

1. **Chamam a API** via a instância `api` (axios com token)
2. **Normalizam os dados** — o backend usa nomes de campos diferentes dos tipos do frontend

### Exemplo de normalização — Pet

O backend retorna:
```json
{ "owner_id": 5, "name": "Rex", "breed": "Labrador", "sex": "macho", "size": "grande" }
```

O serviço converte para o tipo `Pet` do frontend:
```ts
{ dono_id: 5, nome: "Rex", raca: "Labrador", sexo: "macho", porte: "grande" }
```

### Mapeamentos importantes

| Campo backend | Campo frontend | Entidade |
|---|---|---|
| `owner_id` | `dono_id` | Pet |
| `name` | `nome` | Pet, User |
| `breed` | `raca` | Pet |
| `sex` | `sexo` | Pet (deve ser `"macho"` ou `"femea"`) |
| `size` | `porte` | Pet |
| `profile_type` | `tipo_perfil` | User |

### Serviço de atendimentos (`atendimentoService.ts`)

Este é o mais complexo. O backend tem endpoints inconsistentes, então o serviço tenta múltiplos caminhos em sequência até encontrar um que funcione (`/appointment/appointments`, `/appointments`, `/appointment`, etc.) e normaliza variações de nomes de campos (`valor_final` vs `final_value` vs `value_final`).

---

## Tipos TypeScript (`src/types/`)

Cada arquivo define as interfaces usadas pelo frontend. Os tipos refletem os dados **já normalizados** (após conversão pelo serviço), não os campos brutos da API.

| Arquivo | Interface principal | Campos chave |
|---|---|---|
| `pet.ts` | `Pet` | id, nome, raca, sexo, porte, dono_id, categoria_id, tags |
| `atendimento.ts` | `Atendimento` | id, valor_final, data_atendimento, status, cliente_id, pet_id, items |
| `usuario.ts` | `Usuario` | id, nome, email, tipo_perfil, ativo, client_profile, employee_profile |
| `loja.ts` | `Loja` | id, nome, cnpj, telefone, email, cep, funcionarios |
| `servico.ts` | `Servico` | id, nome, descricao, preco |
| `categoria.ts` | `Categoria` | id, name, description |
| `tag.ts` | `Etiqueta` | id, nome, descricao |

---

## Shells e layouts

### `PublicShell` — visitantes não autenticados

Usa `Navbar.tsx` no topo com links: Home, Login, Cadastrar. As páginas ficam abaixo.

### `ClienteShell` — clientes autenticados

Usa `ClienteLayout.tsx`: sidebar fixa à esquerda no desktop, menu hambúrguer no mobile.

Navegação disponível:
- Home (dashboard do cliente)
- Meus Pets
- Atendimentos
- Serviços (somente leitura)
- Lojas
- Tags (somente leitura)

### `FuncionarioShell` — funcionários autenticados

Usa `FuncionarioLayout.tsx`: mesmo padrão de sidebar, com mais itens.

Navegação disponível:
- Home (dashboard com KPIs)
- Pets (CRUD completo)
- Atendimentos (CRUD completo)
- Serviços (CRUD completo)
- Categorias (CRUD completo)
- Lojas (CRUD completo)
- **Usuários** (exclusivo do funcionário)
- Tags (CRUD completo)

---

## Páginas

### Páginas públicas

| Página | Arquivo | O que faz |
|---|---|---|
| Landing page | `pages/Home.tsx` | Hero, features, call-to-action para login/cadastro |
| Login | `pages/LoginPage.tsx` | Formulário email + senha, chama `/auth/login` |
| Cadastro | `pages/RegisterPage.tsx` | Seletor pessoa física/jurídica, formulário com máscara de CPF/CNPJ |

### Páginas do cliente

| Página | Arquivo | O que faz |
|---|---|---|
| Dashboard | `pages/cliente/Home.tsx` | Cards de estatísticas (gastos, visitas, pets), shortcuts, pets recentes, últimos atendimentos |
| Meus Pets | `pages/cliente/PetsPage.tsx` | Lista apenas pets onde `pet.dono_id === userId`, pode criar/editar seus próprios pets |
| Atendimentos | `pages/cliente/AtendimentosPage.tsx` | Lista apenas atendimentos onde `atendimento.cliente_id === userId` |
| Serviços | `pages/cliente/ServicosPage.tsx` | Catálogo de serviços — somente leitura |
| Categorias | `pages/cliente/CategoriasPage.tsx` | Catálogo de categorias — somente leitura |
| Tags | `pages/cliente/TagsPage.tsx` | Lista de tags — somente leitura |
| Lojas | `pages/cliente/LojasPage.tsx` | Grade de cards de lojas — somente leitura |
| Detalhe da loja | `pages/cliente/LojaPage.tsx` | Informações completas de uma loja |
| Perfil | `pages/cliente/ProfilePage.tsx` | Editar dados pessoais do cliente |

### Páginas do funcionário

| Página | Arquivo | O que faz |
|---|---|---|
| Dashboard | `pages/funcionario/Home.tsx` | KPIs com deltas mensais, alertas operacionais, mini gráfico de barras, ranking de lojas, últimos atendimentos |
| Pets | `pages/funcionario/PetsPage.tsx` | CRUD completo de todos os pets |
| Atendimentos | `pages/funcionario/AtendimentosPage.tsx` | CRUD completo de todos os atendimentos |
| Serviços | `pages/funcionario/ServicosPage.tsx` | CRUD completo de serviços (banho, tosa etc.) |
| Categorias | `pages/funcionario/CategoriasPage.tsx` | CRUD completo de categorias de pets |
| Tags | `pages/funcionario/TagsPage.tsx` | CRUD completo de etiquetas |
| Lojas | `pages/funcionario/LojasPage.tsx` | CRUD completo de lojas |
| Detalhe da loja | `pages/funcionario/LojaPage.tsx` | Informações + roster de funcionários da loja |
| Usuários | `pages/funcionario/UsersPage.tsx` | Listagem e gestão de todos os usuários (exclusivo) |
| Perfil | `pages/funcionario/ProfilePage.tsx` | Editar dados do funcionário |

---

## Padrões de UI recorrentes

### Padrão "toggle do formulário de criação"

Todas as páginas CRUD seguem o mesmo padrão:

```
Estado inicial: formulário escondido
Botão "+ Novo X" → abre o formulário
Botão "Cancelar"  → fecha o formulário
Submit com sucesso → fecha o formulário automaticamente (setShowForm(false))
```

### Layout de listas

- **Pets e Usuários**: tabela com colunas de largura fixa via `grid-cols-[...]`
- **Tags**: linhas de tabela em contexto editável; chips coloridos em contexto somente leitura
- **Atendimentos**: linhas colapsáveis — resumo sempre visível, serviços/observações revelados por chevron
- **Lojas**: grade 2 colunas de cards clicáveis com rodapé de ações

### Sistema de design

O projeto usa um tema claro consistente. Não há tema escuro.

```
Wrapper de página:   px-8 py-8
Card:                rounded-2xl border border-gray-100 bg-white shadow-sm
Card de formulário:  rounded-2xl border border-gray-100 bg-white p-6 shadow-sm
Input:               w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm
                     focus:border-[#1c46f3] focus:bg-white focus:ring-2 focus:ring-[#1c46f3]/15
Botão primário:      bg-gradient-to-r from-[#1c46f3] to-[#1840e0] text-white
Toast de sucesso:    border-emerald-200 bg-emerald-50 text-emerald-700
Toast de erro:       border-red-200 bg-red-50 text-red-600
```

**Cores da marca:**
- `#1c46f3` — azul principal
- `#00bb69` — verde
- `#ffd200` — amarelo

---

## Variáveis de ambiente

Arquivo `.env` na raiz do projeto:

```
VITE_API_URL=/api
VITE_BACKEND_URL=http://127.0.0.1:8000
```

- `VITE_API_URL` — URL base do axios (usa `/api` que o Vite proxeia para o backend em dev)
- `VITE_BACKEND_URL` — alvo do proxy Vite, configurado em `vite.config.ts`

Em produção, o `VITE_API_URL` deve apontar para o backend real.

---

## Comandos de desenvolvimento

```bash
npm run dev      # Inicia o servidor Vite com HMR (hot module replacement)
npm run build    # Checagem TypeScript + build de produção para dist/
npm run lint     # Roda ESLint (sem auto-fix)
npm run preview  # Visualiza o build de produção localmente
```

Não há suite de testes. A checagem de tipos (`tsc -b`) é o principal mecanismo de correção automatizada.

---

## Pontos de atenção

- **Sem paginação no servidor** — todos os dados são buscados de uma vez e filtrados no cliente
- **`sex` do pet** — deve ser enviado como `"macho"` ou `"femea"` (minúsculo, sem abreviação)
- **`breed` do pet é obrigatório** — o backend rejeita criação sem este campo
- **Filtragem client-side** — clientes veem apenas seus próprios pets e atendimentos, mas o backend retorna tudo; a filtragem acontece no frontend
- **`theme.ts` é legado** — o arquivo `src/lib/theme.ts` existe mas não deve ser usado em páginas novas
- **Token no localStorage** — o JWT fica acessível ao JavaScript (sem cookie HttpOnly); decisão de design atual
