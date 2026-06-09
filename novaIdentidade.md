# Guia de Identidade Visual — Pet Club Petstore
> Proposta de nova identidade visual. Substitui completamente a paleta e estilo anterior.

---

## 1. Conceito da Marca

**Pet Club** é uma plataforma de gestão para petshops — simples, direta e humana. O nome curto pede uma identidade que seja igualmente objetiva: sem excessos, mas com personalidade. A proposta visual aposta em um tom profissional e moderno, com calor suficiente para o universo pet.

**Palavras-chave:** confiança · clareza · cuidado · leveza

---

## 2. Paleta de Cores

### Cores Primárias
| Nome | Hex | Uso |
|------|-----|-----|
| Teal Profundo | `#0D7377` | Cor principal da marca — botões, navbar ativa, headers |
| Teal Escuro | `#085C60` | Variação dark para hover e fundos densos |
| Âmbar Quente | `#F59E0B` | Destaques, badges, ícones de ação, CTAs secundários |
| Verde Menta | `#10B981` | Status de sucesso, confirmações, indicadores positivos |

### Cores de Interface
| Nome | Hex | Uso |
|------|-----|-----|
| Carvão | `#1E293B` | Textos principais, títulos, ícones |
| Off-white | `#F8FAFC` | Fundo de página |
| Branco | `#FFFFFF` | Fundo de cards e modais |
| Cinza Borda | `#E2E8F0` | Bordas, divisores, separadores |
| Cinza Texto | `#64748B` | Metadados, labels, textos de apoio |
| Cinza Leve | `#F1F5F9` | Hover em itens de lista, fundo de inputs |

### Cor de Destaque (sparingly)
| Nome | Hex | Uso |
|------|-----|-----|
| Coral | `#F97316` | CTA principal em fundos escuros, notificações urgentes |

### Tokens CSS

```css
:root {
  /* Marca */
  --jon-teal:         #0D7377;
  --jon-teal-dark:    #085C60;
  --jon-amber:        #F59E0B;
  --jon-green:        #10B981;
  --jon-coral:        #F97316;

  /* Interface */
  --jon-charcoal:     #1E293B;
  --jon-bg:           #F8FAFC;
  --jon-white:        #FFFFFF;
  --jon-border:       #E2E8F0;
  --jon-text-muted:   #64748B;
  --jon-bg-subtle:    #F1F5F9;

  /* Tipografia */
  --jon-font:         'Inter', 'Nunito Sans', 'Segoe UI', sans-serif;

  /* Raios */
  --jon-radius-sm:    4px;
  --jon-radius:       8px;
  --jon-radius-lg:    12px;
  --jon-radius-pill:  999px;

  /* Espaçamento */
  --jon-gap:          16px;
  --jon-section-gap:  64px;
  --jon-container:    1280px;
}
```

---

## 3. Tipografia

### Família
- **Principal:** `Inter` — sem serifa, ótima legibilidade em UI
- **Fallback:** `'Nunito Sans', 'Segoe UI', Arial, sans-serif`

### Hierarquia
| Elemento | Tamanho | Peso | Cor |
|----------|---------|------|-----|
| Hero title | 48–56px | 800 ExtraBold | `#FFFFFF` ou `#F59E0B` |
| Título de seção | 24–28px | 700 Bold | `#1E293B` |
| Título de card | 16–18px | 600 SemiBold | `#1E293B` |
| Corpo | 14–15px | 400 Regular | `#1E293B` |
| Metadado / label | 12–13px | 500 Medium | `#64748B` |
| Badge / pill | 11–12px | 600 SemiBold | variável |

---

## 4. Logotipo

### Conceito
- Tipografia: **`Pet Club`** em caixa baixa, fonte Inter ExtraBold
- Ícone: pata estilizada em forma geométrica simples (quadrado com corte diagonal ou círculo com pata vazada) — sem os 4 quadrantes coloridos do estilo anterior
- A palavra "Petstore" aparece como subtítulo opcional em Regular, bem menor
- Versão primária: ícone teal `#0D7377` + texto carvão `#1E293B`
- Versão invertida (fundo escuro): tudo em branco `#FFFFFF`
- Versão monocromática: tudo em `#1E293B`

### Proporções
- Ícone: 32×32px no header
- Altura do texto "Pet Club": 22–24px
- Espaço entre ícone e texto: 8px

---

## 5. Componentes Visuais

### 5.1 Banner Hero
```
- Fundo: Teal Profundo #0D7377 (sólido, sem degradê pesado)
- Elementos decorativos: formas geométricas limpas (círculos e traços)
  em branco com 10–15% de opacidade — sutis, não chamativos
- Texto: branco, alinhado à esquerda
- CTA principal: Coral #F97316, texto branco
- CTA secundário: borda branca 1.5px, fundo transparente
- Nenhum triângulo colorido ou "confete" de múltiplas cores
```

### 5.2 Cards
```
- Fundo: branco #FFFFFF
- Borda: 1px solid #E2E8F0
- Border-radius: 8px
- Sombra: 0 1px 3px rgba(0,0,0,0.07)
- Hover: sombra 0 4px 16px rgba(13,115,119,0.12) + translateY(-2px)
- Barra de acento no topo: 3px solid var(--jon-teal)
```

### 5.3 Botões
```
Primário:
  background: #0D7377
  color: #FFFFFF
  border-radius: 6px
  padding: 10px 20px
  hover: background #085C60

CTA (destaque máximo):
  background: #F97316
  color: #FFFFFF
  hover: background #EA6A06

Secundário / Outline:
  background: transparent
  border: 1.5px solid #0D7377
  color: #0D7377
  hover: background #F1F5F9

Ghost (destrutivo ou neutro):
  background: transparent
  color: #64748B
  hover: background #F1F5F9
```

### 5.4 Navbar
```
- Fundo: branco #FFFFFF
- Borda inferior: 1px solid #E2E8F0
- Logo à esquerda
- Links em #1E293B, 14px, sem negrito
- Item ativo: indicador 2px teal embaixo do link
- Avatar / menu do usuário: à direita
```

### 5.5 Sidebar (layouts internos)
```
- Fundo: Carvão #1E293B
- Texto: branco/rgba(255,255,255,0.75)
- Item ativo: fundo #0D7377, texto branco
- Hover: fundo rgba(255,255,255,0.06)
- Logo: versão branca do Pet Club
- Largura: 240px
```

### 5.6 Badges e Pills
```css
/* Status positivo */
.badge-success {
  background: #DCFCE7;
  color: #15803D;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

/* Status neutro / pendente */
.badge-neutral {
  background: #F1F5F9;
  color: #475569;
}

/* Categoria / tipo */
.badge-brand {
  background: #CCEFEF;
  color: #085C60;
}

/* Urgente / alerta */
.badge-warning {
  background: #FEF3C7;
  color: #92400E;
}
```

---

## 6. Layout e Espaçamento

| Elemento | Valor |
|----------|-------|
| Container máximo | `1280px` |
| Padding lateral | `24px` (mobile: `16px`) |
| Gap entre cards | `16px` |
| Padding interno de card | `20–24px` |
| Espaço entre seções | `64px` |
| Border-radius padrão | `8px` |
| Border-radius de pills | `999px` |

---

## 7. O que abandonar (comparado ao estilo anterior)

| Antes (Apex) | Agora (Pet Club) |
|--------------|-------------|
| Azul Royal `#1A3CB8` como cor principal | Teal `#0D7377` como cor da marca |
| Amarelo `#F5A800` em destaque geral | Âmbar `#F59E0B` apenas para acentos pontuais |
| Formas geométricas coloridas em múltiplas cores (confete) | Formas geométricas sutis, brancas com baixa opacidade |
| Sidebar/navbar claras | Sidebar escura (`#1E293B`) nos layouts internos |
| Quatro quadrantes coloridos no ícone | Ícone limpo com pata estilizada |
| Nome "ApexBrasil" / "Apex Petstore" | Nome "Pet Club" / "Pet Club Petstore" |
| Azul `#0060B6` na topbar | Não se aplica — sem topbar de intranet |

---

## 8. Checklist de Implementação

- [ ] **Tokens:** Trocar todas as variáveis de cor nos arquivos `.ts`/`.tsx` pela nova paleta
- [ ] **theme.ts:** Renomear `apexTheme` → `jonTheme` e atualizar valores
- [ ] **Logo:** Criar/substituir `logo_apex.png` e `logo_apex.ico` pelos assets do Pet Club
- [ ] **Hero:** Trocar fundo azul royal pelo Teal Profundo `#0D7377`
- [ ] **Elementos decorativos:** Remover formas coloridas; substituir por círculos/traços brancos e sutis
- [ ] **Sidebar:** Aplicar fundo escuro `#1E293B` nos layouts Admin, Funcionário e Cliente
- [ ] **Botão primário:** Mudar para Teal `#0D7377`; CTA de conversão para Coral `#F97316`
- [ ] **Footer:** Fundo `#1E293B`, texto `#64748B`, copyright "Pet Club"
- [ ] **Imagens de fundo** (login, register): Substituir `apex4.jpg` / `apex5.jpg` por novas fotos de pet/petshop
- [ ] **Fonte:** Confirmar que `Inter` está carregada via Google Fonts ou `@fontsource/inter`
