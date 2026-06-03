# Apex Brasil Petstore — Frontend

Sistema de gerenciamento para a rede de pet shops **Apex Brasil Petstore**, desenvolvido como projeto de trilha prática. Permite o cadastro e controle de lojas, funcionários, clientes, pets, serviços e agendamentos de atendimentos.

**Demo ao vivo:** [https://front-apex-delta.vercel.app](https://front-apex-delta.vercel.app)

---

## Funcionalidades

- Autenticação com JWT (login por perfil: admin, funcionário ou cliente)
- Gerenciamento de lojas da rede
- Cadastro de funcionários e clientes
- Cadastro e acompanhamento de pets com categorias e tags
- Catálogo de serviços com preços
- Agendamento e controle de atendimentos
- Painel diferenciado por perfil de acesso

---

## Credenciais para teste

### Administrador
| Campo | Valor |
|-------|-------|
| Email | `admin@apexbrasil.com` |
| Senha | `Admin@2024` |
| Acesso | Painel completo: lojas, usuários, serviços, atendimentos |

### Funcionários
| Nome | Email | Senha | Loja |
|------|-------|-------|------|
| Carlos Mendes | `carlos.mendes@apexbrasil.com` | `Apex@2024` | Centro (SP) |
| Julia Costa | `julia.costa@apexbrasil.com` | `Apex@2024` | Norte (SP) |
| Bruna Almeida | `bruna.almeida@apexbrasil.com` | `Apex@2024` | Asa Sul (DF) |
| Marcos Andrade | `marcos.andrade@apexbrasil.com` | `Apex@2024` | Asa Norte (DF) |
| Fernanda Vieira | `fernanda.vieira@apexbrasil.com` | `Apex@2024` | Plano Piloto (DF) |

### Clientes
| Nome | Email | Senha | Pet |
|------|-------|-------|-----|
| Maria Silva | `maria.silva@email.com` | `Cliente@2024` | Thor (Labrador) |
| João Oliveira | `joao.oliveira@email.com` | `Cliente@2024` | Mia (Siamês) |
| Ana Pereira | `ana.pereira@email.com` | `Cliente@2024` | Bob (Golden Retriever) |
| Lucas Santos | `lucas.santos@email.com` | `Cliente@2024` | Nemo (Peixe-palhaço) |
| Camila Fernandes | `camila.fernandes@email.com` | `Cliente@2024` | Mel (Yorkshire) |

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite |
| Estilização | Tailwind CSS 4 |
| Roteamento | React Router DOM 7 |
| HTTP | Axios |
| Ícones | Lucide React |
| Deploy | Vercel |

**Backend:** FastAPI (Python) + PostgreSQL — repositório [TrilhaApex](https://github.com/gabrielcaixeta01/TrilhaApex)

---

## Rodando localmente

### Pré-requisitos
- Node.js 18+
- Backend rodando em `http://localhost:8000` (veja o repositório do backend)

### Instalação

```bash
git clone https://github.com/gabrielcaixeta01/frontApex.git
cd frontApex
npm install
npm run dev
```

O Vite sobe em `http://localhost:5173` e faz proxy automático das chamadas `/api/*` para o backend local — nenhuma configuração extra necessária.

### Variáveis de ambiente (dev)

O arquivo `.env` já está configurado para desenvolvimento local:

```env
VITE_API_URL=/api
VITE_BACKEND_URL=http://127.0.0.1:8000
```

---

## Deploy (produção)

O projeto é deployado no **Vercel**. A única variável de ambiente necessária é:

```env
VITE_API_URL=https://trilhaapex.onrender.com
```

Configure em: **Vercel Dashboard → Project → Settings → Environment Variables**
