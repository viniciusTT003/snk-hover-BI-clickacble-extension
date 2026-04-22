# VCompactBar – Click to Open 🚀

Extensão de navegador que **converte a barra lateral `VCompactBar` de hover para clique**, evitando **cliques acidentais** e melhorando significativamente a **UX** em sistemas que utilizam esse componente (especialmente aplicações GWT).

> ✅ Testado em navegadores **Chromium-based** (Chrome, Edge, Brave, etc.)

---

## ✨ O que esta extensão faz

* ❌ Bloqueia completamente o comportamento de **hover** da VCompactBar
* 🖱️ Abre o menu **apenas com clique**
* 🧠 Fecha o menu ao **clicar fora da barra**
* 🛡️ Evita conflitos com o GWT usando interceptação na **fase de captura**
* 🔄 Observa mudanças dinâmicas do DOM para impedir que o sistema reabra o menu sozinho

---

## 🧩 Como funciona (visão geral)

A extensão atua em três frentes principais:

1. **Interceptação de eventos de mouse**
   Bloqueia `mouseover`, `mouseenter`, `mouseout` e `mouseleave` reais antes que o GWT os processe.

2. **Controle por clique**

   * Clique na barra → abre o menu
   * Clique fora da barra → fecha o menu

3. **MutationObserver ativo**
   Garante que:

   * Se o GWT abrir o menu sozinho → ele é fechado imediatamente
   * Se o GWT fechar o menu nativamente → o estado interno é sincronizado

---

## 📁 Estrutura do projeto

```
.
├── manifest.json
└── content.js
```

---

## 📄 manifest.json

```json
{
  "manifest_version": 3,
  "name": "VCompactBar - Click to Open",
  "version": "1.0",
  "description": "Converte o VCompactBar de hover para click, melhorando a UX.",
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_start",
      "all_frames": true
    }
  ]
}
```

🔎 **Por que `document_start`?**
Para garantir que os eventos de hover sejam bloqueados **antes** do GWT inicializar.

---

## 📜 content.js (resumo técnico)

### Estado interno

```js
let isMenuOpen = false;
let interceptActive = false;
```

### Interceptação de hover (capture phase)

```js
document.addEventListener('mouseover', blockHover, { capture: true });
document.addEventListener('mouseenter', blockHover, { capture: true });
document.addEventListener('mouseout', blockHoverOut, { capture: true });
document.addEventListener('mouseleave', blockHoverOut, { capture: true });
```

✔️ Apenas eventos **reais** (`isTrusted === true`) são bloqueados
✔️ Eventos sintéticos continuam funcionando

---

### Abertura e fechamento por clique

```js
document.addEventListener('click', handleClick, { capture: true });
```

* Clique **na barra** → abre
* Clique **fora da barra** → fecha

---

### MutationObserver (anti-reabertura automática)

```js
const observer = new MutationObserver(() => {
  // sincroniza estado com aria-hidden / display
});
```

Isso resolve problemas clássicos do GWT, como:

* Menu abrindo sozinho ao carregar
* Estado interno quebrando após clicar em links do menu

---

## 🛠️ Como instalar (modo desenvolvedor)

1. Clone este repositório ou baixe os arquivos
2. Abra o navegador Chromium
3. Vá para:

```
chrome://extensions
```

4. Ative **Modo do desenvolvedor**
5. Clique em **Carregar sem compactação**
6. Selecione a pasta do projeto

✅ Pronto! A extensão já estará ativa

---

## ⚠️ Limitações conhecidas

* Projetada especificamente para elementos com a classe:

```css
.VCompactBar
```

* Não testada em Firefox (Manifest V3 + APIs diferentes)
* Atua em **todas as URLs** (ajuste o `matches` se necessário)

---

## 🔧 Customização

Se quiser limitar a extensão a um domínio específico:

```json
"matches": ["https://seudominio.com/*"]
```

Ou alterar o seletor da barra:

```js
function getBar() {
  return document.querySelector('.VCompactBar');
}
```

---

## 📜 Licença

MIT — use, modifique e adapte livremente.

---

## 🤝 Contribuições

Pull requests são bem-vindos!
Se você também sofre com menus que abrem sozinhos, esta extensão é pra você 😄

---

**Feito para salvar cliques, sanidade mental e UX.**
