# Refactor: Escopo por Loja para Funcionários

## Contexto

Atualmente, ao logar como funcionário (não-superuser), o app usa os mesmos arquivos que o admin (`pages/funcionario/`), mas exibe dados de **toda a rede de lojas** — o que é incorreto.

O objetivo é:

- **Admin (superuser)** → redirecionar para `pages/admin/` — visão completa de toda a rede.
- **Funcionário (não-superuser)** → manter em `pages/funcionario/`, mas com visão **restrita à loja em que trabalha**.

---

## 1. Como identificar o tipo de usuário

O `localStorage("user")` retornado pelo login contém o campo `is_superuser: boolean`.

```ts
// App.tsx — getStoredRole()
function getStoredUser() {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
}

const user = getStoredUser();
const isSuperuser = user.is_superuser === true;
const role = user.role ?? user.profile_type ?? user.tipo_perfil;
```

A `loja_id` do funcionário não está diretamente no `localStorage("user")` — ela vem do `employee_profile.loja_id`, obtido via `getUsuarioById(user.id)` ou `/auth/me` completo.

**Solução recomendada:** criar um hook/contexto `useFuncionarioStore` que, ao montar, busca `getUsuarioById(user.id)` e expõe `lojaId: number`. Todas as páginas de funcionário consomem esse hook.

---

## 2. Mudanças em `App.tsx`

```
Antes:
  !isLogged → PublicShell
  role === "cliente" → ClienteShell
  qualquer outro → FuncionarioShell  ← admin e funcionário misturados

Depois:
  !isLogged → PublicShell
  role === "cliente" → ClienteShell
  role === "funcionario" && is_superuser → AdminShell   (importa pages/admin/)
  role === "funcionario" && !is_superuser → FuncionarioShell (pages/funcionario/ com escopo)
```

Será necessário:
- Criar `AdminShell` em `App.tsx` importando as páginas de `pages/admin/`.
- Criar (ou reutilizar) `AdminLayout` em `components/admin/`.
- `FuncionarioShell` permanece, mas suas páginas serão ajustadas.

---

## 3. Hook compartilhado — `useFuncionarioStore`

Criar `src/hooks/useFuncionarioStore.ts`:

```ts
// Retorna { lojaId, lojaName, loading }
// Faz a busca de getUsuarioById na montagem e cacheia no contexto
```

Todas as páginas de `pages/funcionario/` importam esse hook para obter o `lojaId` do funcionário logado e filtrar os dados.

---

## 4. Mudanças por arquivo em `pages/funcionario/`

### `Home.tsx`
| Hoje | Depois |
|------|--------|
| KPIs de toda a rede | KPIs filtrados por `lojaId` |
| Ranking de lojas | Removido — substituído por stats da própria loja |
| Alertas de toda a rede | Apenas alertas da sua loja |
| Atendimentos recentes — todos | Apenas da sua loja |
| Gráfico mensal — toda a rede | Apenas da sua loja |

---

### `AtendimentosPage.tsx`
| Hoje | Depois |
|------|--------|
| Lista todos os atendimentos | Filtra por `loja_id === lojaId` |
| Selector de loja no formulário de criação | Campo oculto/fixo com `lojaId` do funcionário |
| Stats (receita, concluídos, agendados) | Calculados apenas sobre os atendimentos da loja |

Mudança no `AppointmentForm`: o campo `store_id` não deve ser um select livre — deve ser preenchido automaticamente com o `lojaId` do funcionário e ocultado.

---

### `PetsPage.tsx`
| Hoje | Depois |
|------|--------|
| Lista todos os pets | Lista pets cujos donos têm atendimentos na `lojaId` do funcionário |

Estratégia de filtragem: após buscar atendimentos e pets, cruzar `pet_id` dos atendimentos da loja com a lista de pets.

---

### `LojasPage.tsx` → **"Minha Loja"**
| Hoje | Depois |
|------|--------|
| Lista todas as lojas da rede | Exibe apenas os dados da loja do funcionário |
| Link para cada loja | Redireciona direto para `/lojas/:lojaId` |

A página pode ser simplificada para apenas redirecionar para `<Navigate to={/lojas/${lojaId}} replace />` assim que o `lojaId` for carregado.

---

### `LojaPage.tsx`
| Hoje | Depois |
|------|--------|
| Pode visualizar qualquer loja por `:id` | Restringir: se `id !== lojaId`, redirecionar para `/lojas/${lojaId}` |

---

### `UsersPage.tsx`
| Hoje | Depois |
|------|--------|
| Lista todos os usuários da rede | Lista apenas clientes com atendimentos na loja do funcionário + os funcionários da mesma loja |
| Pode criar funcionários para qualquer loja | Ao criar funcionário, `store_id` é fixo com `lojaId` |

---

### `ServicosPage.tsx`
Serviços são globais (não são por loja). **Sem mudanças funcionais.** Apenas verificar se o funcionário deve poder criar/editar serviços — se não, remover os botões de criação/edição.

---

### `CategoriasPage.tsx`
Categorias são globais. **Sem mudanças funcionais** — mesma lógica do admin, mas sem permissões de edição se necessário.

---

### `TagsPage.tsx`
Tags são globais. **Sem mudanças funcionais** — idem categorias.

---

### `ProfilePage.tsx`
Já está corretamente escopado ao usuário logado. **Sem mudanças.**

---

### `NavFuncionario.tsx` / `FuncionarioLayout.tsx`
| Hoje | Depois |
|------|--------|
| Item "Lojas" no menu | Item "Minha Loja" apontando para `/lojas` |
| Item "Usuários" aparece sempre | Pode permanecer (escopo de filtragem resolve no componente) |

---

## 5. Backend — mudanças necessárias?

**Majoritariamente não.** O front já busca todos os dados e pode filtrar por `loja_id` no lado cliente.

Porém, há um ponto de atenção:
- `GET /appointment/appointments` retorna **todos** os atendimentos. Para grandes volumes, isso é ineficiente.
- Seria ideal que o backend suportasse `?store_id={id}` como query param de filtro.
- Para o MVP do refactor, **filtragem no front é suficiente**.

---

## 6. Ordem de implementação sugerida

1. **`App.tsx`** — separar `AdminShell` e ajustar `AppShell` para redirecionar por `is_superuser`.
2. **`AdminLayout`** — criar layout visual para admin (pode ser clone do `FuncionarioLayout` com ajuste de cor/label).
3. **`useFuncionarioStore` hook** — centralizar a busca do `lojaId` do funcionário logado.
4. **`Home.tsx`** — filtrar dados pelo `lojaId`.
5. **`AtendimentosPage.tsx`** — filtrar + fixar `store_id` no form.
6. **`PetsPage.tsx`** — filtrar pets pela loja.
7. **`LojasPage.tsx`** → redirecionar para `LojaPage` da própria loja.
8. **`UsersPage.tsx`** — filtrar usuários relevantes à loja.
9. **`NavFuncionario.tsx`** — renomear "Lojas" → "Minha Loja".

---

## 7. Dados disponíveis no `localStorage("user")`

```json
{
  "id": 5,
  "name": "João Silva",
  "email": "joao@loja.com",
  "role": "funcionario",
  "is_superuser": false,
  "active": true
}
```

> `employee_profile.loja_id` **não** está no token/localStorage — requer chamada adicional a `getUsuarioById(id)` ou `/auth/me` expandido. O hook `useFuncionarioStore` encapsula essa chamada.

---

## Resumo

| Arquivo | Mudança |
|---------|---------|
| `App.tsx` | Separar AdminShell; redirecionar superuser para admin |
| `components/admin/AdminLayout` | Criar layout para admin |
| `hooks/useFuncionarioStore` | Novo hook — provê `lojaId` do funcionário logado |
| `funcionario/Home` | Filtrar todos os dados por `lojaId` |
| `funcionario/AtendimentosPage` | Filtrar + `store_id` fixo no form |
| `funcionario/PetsPage` | Filtrar pets pela loja |
| `funcionario/LojasPage` | Redirecionar para LojaPage da própria loja |
| `funcionario/LojaPage` | Bloquear acesso a outras lojas |
| `funcionario/UsersPage` | Filtrar usuários pela loja |
| `funcionario/NavFuncionario` | "Lojas" → "Minha Loja" |
| `funcionario/ServicosPage` | Sem mudanças (serviços são globais) |
| `funcionario/CategoriasPage` | Sem mudanças (globais) |
| `funcionario/TagsPage` | Sem mudanças (globais) |
| `funcionario/ProfilePage` | Sem mudanças |
| Backend | Sem mudanças obrigatórias (filtragem no front) |
