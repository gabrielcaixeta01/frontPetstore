# Guia de Identidade Visual — ApexBrasil
> Referência extraída da Intranet "Entre Nós" para aplicar na Petstore Apex

---

## 1. Paleta de Cores

### Cores Primárias
| Nome | Hex | Uso |
|------|-----|-----|
| Azul Royal | `#1A3CB8` | Fundo principal de banners, navbar ativa, headers de seção |
| Azul Escuro | `#0D2580` | Variação mais escura do azul primário |
| Amarelo Âmbar | `#F5A800` | Títulos em destaque, acentos, ícones e elementos gráficos |
| Verde | `#00A651` | Elementos gráficos decorativos, badges de categoria |

### Cores Secundárias / UI
| Nome | Hex | Uso |
|------|-----|-----|
| Branco | `#FFFFFF` | Fundo de cards, texto sobre azul, áreas de conteúdo |
| Cinza Claro | `#F4F4F4` | Background de página, fundo de seções alternadas |
| Cinza Médio | `#6B6B6B` | Texto de metadados (autor, data, contagem de views) |
| Cinza Borda | `#E0E0E0` | Bordas de cards e divisores |
| Azul Navbar | `#0060B6` | Barra de navegação global do SharePoint (pode usar como referência para topbar) |

### Gradiente Decorativo (banner "Processos e Documentos")
```css
/* Círculo decorativo com gradiente amarelo → laranja → azul */
background: conic-gradient(#F5A800, #E07B00, #1A3CB8);
```

---

## 2. Tipografia

### Família de Fontes
- **Fonte principal:** Sem serifa moderna — visualmente compatível com `Raleway`, `Nunito Sans` ou `Inter`
- **Fonte de títulos de destaque:** Bold/ExtraBold, letras maiúsculas com espaçamento normal
- **Fallback seguro:** `'Segoe UI', Arial, sans-serif` (padrão do SharePoint/Office)

### Hierarquia Tipográfica
| Elemento | Tamanho aprox. | Peso | Cor |
|----------|---------------|------|-----|
| Título hero (banner) | 48–56px | 800 ExtraBold | Branco ou Amarelo `#F5A800` |
| Subtítulo hero | 28–32px | 400 Regular | Branco |
| Título de seção (`Notícias`) | 22–24px | 600 SemiBold | Cinza escuro `#222222` |
| Título de card de notícia | 16–18px | 600 SemiBold | `#1A1A1A` |
| Corpo/resumo de notícia | 14px | 400 Regular | `#444444` |
| Metadados (autor, data, views) | 12–13px | 400 Regular | `#6B6B6B` |
| Label de categoria (pill) | 11–12px | 500 Medium | Azul `#1A3CB8` |

---

## 3. Logo e Marca

### Logotipo "apexBrasil"
- Tipografia personalizada em caixa baixa (`apexBrasil`)
- Ícone: quadrado com quatro quadrantes em azul, amarelo, verde e branco
- Versões: fundo escuro (branco) e fundo claro (colorido)
- No header: ícone colorido + texto escuro
- Em banners: logo branco completo

### Aplicação na Intranet
- Header da página: ícone 40×40px + nome do site em negrito ao lado
- Navegação global: logo pequeno no canto superior esquerdo da topbar azul

---

## 4. Componentes Visuais

### 4.1 Banner Hero (topo das páginas)
```
- Fundo: Azul Royal #1A3CB8 (sólido ou com elementos gráficos)
- Altura: ~250–280px
- Elementos decorativos: formas geométricas (triângulos, círculos, losangos)
  nas cores amarelo, verde e branco — distribuídas à direita
- Texto: alinhado à esquerda ou centro, branco
- Título em destaque: amarelo #F5A800
```

### 4.2 Cards de Notícia
```
- Fundo: branco
- Borda: nenhuma (usa sombra leve) ou 1px solid #E0E0E0
- Border-radius: 4–6px
- Imagem: topo do card, aspect-ratio 16:9
- Label de categoria: pequena, acima do título, cor azul
- Título: 16–18px, semibold
- Resumo: 2–3 linhas, 14px, cinza
- Rodapé: avatar do autor + nome + data + contagem de views
```

**Layout da grade de notícias:**
- 1 card grande à esquerda (featured) + lista de cards menores à direita
- Card featured: imagem grande + categoria + título + resumo + autor
- Cards menores: thumbnail 120×80px + categoria + título + resumo curto + autor

### 4.3 Cards de Seção (estilo "Processos e Documentos")
```
- Layout full-width dividido em blocos 50/50 ou 33/66
- Imagem de fundo com overlay escuro semitransparente
- Título branco centralizado na parte inferior do card
- Hover: leve escurecimento do overlay
- Border-radius: 0 (edge-to-edge)
```

### 4.4 Elementos Geométricos Decorativos
Padrão visual recorrente na ApexBrasil:
- Triângulos, meios-círculos, losangos e quadrados com cantos arredondados
- Cores: amarelo `#F5A800`, verde `#00A651`, azul claro `#4A90D9`, branco
- Distribuição: canto direito de banners, formando padrão tipo mosaico/confete
- Tamanhos variados, alguns com outline (apenas borda, sem preenchimento)

---

## 5. Navegação

### Topbar Global (SharePoint)
```
- Fundo: Azul médio #0060B6
- Altura: ~48px
- Itens: ícone apps | logo | links principais | barra de busca | ícones de ação | avatar
- Fonte: branca, 14px
```

### Navbar do Site
```
- Fundo: branco
- Altura: ~44px
- Logo do site + nome à esquerda
- Links de navegação secundária ao centro/direita
- Fonte: cinza escuro, 14px, sem negrito
- Item ativo: sublinhado ou com indicador azul embaixo
- Separador: borda inferior 1px solid #E0E0E0
```

---

## 6. Espaçamento e Layout

| Elemento | Valor |
|----------|-------|
| Container máximo | ~1400px |
| Padding lateral interno | 24–32px |
| Gap entre cards | 16–20px |
| Padding interno de card | 16px |
| Espaço entre seções | 40–48px |
| Border-radius padrão (cards) | 4px |
| Border-radius (pills/badges) | 20px (full pill) |

---

## 7. Badges e Pills de Categoria

```css
/* Exemplo de badge de categoria */
.badge-categoria {
  font-size: 11px;
  font-weight: 500;
  color: #1A3CB8;
  background: transparent;
  padding: 0;
  text-transform: none;
  /* Sem fundo — apenas texto colorido acima do título */
}

/* Variação com fundo (ex: "Corporativa") */
.badge-corporativa {
  font-size: 11px;
  background: #1A3CB8;
  color: #FFFFFF;
  padding: 2px 8px;
  border-radius: 3px;
}
```

---

## 8. Checklist para Aplicar na Petstore Apex

- [ ] **Cores:** Substituir cores genéricas pelas da paleta ApexBrasil (azul `#1A3CB8`, amarelo `#F5A800`, verde `#00A651`)
- [ ] **Fonte:** Usar Inter ou Nunito Sans como fonte principal
- [ ] **Banner hero:** Criar banner com fundo azul + elementos geométricos coloridos à direita + logo ApexBrasil
- [ ] **Navbar:** Fundo branco, logo à esquerda, links em cinza escuro, item ativo com underline azul
- [ ] **Cards de produto/pet:** Estrutura de cards com imagem 16:9, badge de categoria em azul, título semibold, rodapé com metadados em cinza
- [ ] **Elementos decorativos:** Adicionar formas geométricas (triângulos, losangos, meios-círculos) em cantos de banners usando as cores da marca
- [ ] **Tipografia:** Títulos de destaque em amarelo `#F5A800` sobre fundo azul; títulos de seção em cinza escuro sobre branco
- [ ] **Botão primário:** Fundo azul `#1A3CB8`, texto branco, border-radius 4px, sem sombra
- [ ] **Botão secundário:** Outline azul, texto azul, fundo transparente
- [ ] **Footer/metadados:** Usar cinza `#6B6B6B`, 12–13px, para informações secundárias

---

## 9. Tokens CSS Sugeridos

```css
:root {
  /* Cores */
  --apex-blue:        #1A3CB8;
  --apex-blue-dark:   #0D2580;
  --apex-blue-nav:    #0060B6;
  --apex-yellow:      #F5A800;
  --apex-green:       #00A651;
  --apex-white:       #FFFFFF;
  --apex-bg:          #F4F4F4;
  --apex-text:        #1A1A1A;
  --apex-text-muted:  #6B6B6B;
  --apex-border:      #E0E0E0;

  /* Tipografia */
  --apex-font:        'Inter', 'Nunito Sans', 'Segoe UI', Arial, sans-serif;
  --apex-radius:      4px;
  --apex-radius-pill: 20px;

  /* Espaçamento */
  --apex-gap:         16px;
  --apex-section-gap: 48px;
  --apex-container:   1400px;
}
```