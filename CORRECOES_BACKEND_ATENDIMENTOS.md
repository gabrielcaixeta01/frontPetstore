# Correcoes Necessarias no Backend (Atendimentos)

## Resumo do problema
O frontend nao consegue carregar a lista de atendimentos porque o endpoint principal do backend (`GET /appointment/appointments`) retorna **500 Internal Server Error**.

Erro principal identificado nos logs:

```text
sqlite3.OperationalError: no such column: atendimentos.pet_id
```

Isso indica que o codigo backend ja foi atualizado para usar o campo `pet_id`, mas o banco SQLite ainda esta com schema antigo.

---

## Evidencias observadas
- `GET /appointment/appointments` -> **500**
- `GET /appointments` -> **404**
- `GET /appointment` -> **405**
- `GET /atendimento/atendimentos` -> **404**
- `GET /atendimento` -> **404**

Conclusao:
- A rota valida para listagem e `GET /appointment/appointments`.
- O erro de carregamento nao e de frontend; e de **migracao/schema do banco** no backend.

---

## Correcoes obrigatorias no backend

## 1. Aplicar migracoes de banco
Se o projeto usa Alembic, executar no backend:

```bash
alembic upgrade head
```

Objetivo: garantir que a tabela `atendimentos` tenha a coluna `pet_id`.

## 2. Validar schema da tabela `atendimentos`
Confirmar que a tabela possui ao menos:
- `id`
- `valor_final`
- `data_atendimento`
- `forma_pagamento`
- `status`
- `online`
- `observacoes`
- `loja_id`
- `cliente_id`
- `funcionario_id`
- `pet_id`  <- obrigatoria para o estado atual do backend

## 3. Correcao emergencial (somente se nao houver migracao pronta)
Se precisar desbloquear rapidamente em ambiente local, executar SQL manual:

```sql
ALTER TABLE atendimentos ADD COLUMN pet_id INTEGER;
```

Depois, ajustar dados antigos se necessario (valores nulos/relacoes).

## 4. Reiniciar backend e retestar endpoint
Apos migracao:

- Reiniciar API
- Testar:

```http
GET /appointment/appointments
```

Resultado esperado: **200 OK** com lista de atendimentos.

---

## Recomendações adicionais
- Versionar e revisar as migrations para evitar drift entre modelo ORM e banco real.
- Incluir etapa de migracao automatica no bootstrap local (ou script de setup).
- Adicionar teste de integracao para `GET /appointment/appointments` validando schema minimo esperado.

---

## Impacto esperado apos correcao
Com `pet_id` presente no banco e endpoint retornando 200:
- A pagina de atendimentos no frontend volta a carregar normalmente.
- Criacao/edicao/listagem de atendimentos com pet e servicos passa a funcionar como esperado.
