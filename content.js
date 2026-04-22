(function () {
  'use strict';

  // ─── State ────────────────────────────────────────────────────────────────
  let isMenuOpen = false;
  let interceptActive = false;

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function getBar() {
    return document.querySelector('.VCompactBar');
  }

  /**
   * Dispara eventos sintéticos.
   * CORREÇÃO: 'mouseenter' e 'mouseleave' NÃO devem borbulhar (bubbles: false).
   * Isso imita o comportamento real do navegador e impede que o GWT entre em colapso.
   */
  function fireOn(el, type) {
    const doesBubble = type === 'mouseover' || type === 'mouseout';
    el.dispatchEvent(
      new MouseEvent(type, {
        bubbles: doesBubble,
        cancelable: true,
        composed: true,
      })
    );
  }

  function openMenu() {
    const bar = getBar();
    if (!bar || isMenuOpen) return;
    isMenuOpen = true; // Atualizamos o estado ANTES de disparar os eventos
    fireOn(bar, 'mouseover');
    fireOn(bar, 'mouseenter');
  }

  function closeMenu() {
    const bar = getBar();
    if (!bar || !isMenuOpen) return;
    isMenuOpen = false; // Atualizamos o estado ANTES de disparar os eventos
    fireOn(bar, 'mouseout');
    fireOn(bar, 'mouseleave');
  }

  // ─── Core intercept (capture phase, runs before GWT) ──────────────────────

  function blockHover(e) {
    if (!e.isTrusted) return; // let synthetic events through
    const bar = getBar();
    if (!bar) return;
    if (bar.contains(e.target) || e.target === bar) {
      e.stopImmediatePropagation();
    }
  }

  function blockHoverOut(e) {
    if (!e.isTrusted) return;
    const bar = getBar();
    if (!bar) return;
    if (bar.contains(e.target) || e.target === bar) {
      e.stopImmediatePropagation();
    }
  }

  function handleClick(e) {
    const bar = getBar();
    if (!bar) return;

    if (bar.contains(e.target) || e.target === bar) {
      // Clique dentro da barra
      if (!isMenuOpen) {
        openMenu();
      }
    } else {
      // Clique fora da barra
      if (isMenuOpen) {
        closeMenu();
      }
    }
  }

  // ─── Attach listeners once ────────────────────────────────────────────────

  function attach() {
    if (interceptActive) return;
    interceptActive = true;

    // Block real hover/unhover in the capture phase so GWT never sees them
    document.addEventListener('mouseover',  blockHover,    { capture: true, passive: false });
    document.addEventListener('mouseenter', blockHover,    { capture: true, passive: false });
    document.addEventListener('mouseout',   blockHoverOut, { capture: true, passive: false });
    document.addEventListener('mouseleave', blockHoverOut, { capture: true, passive: false });

    // Handle click-to-open / click-outside-to-close
    document.addEventListener('click', handleClick, { capture: true });
  }

  // ─── Wait for the bar to appear, then stay vigilant with MutationObserver ─

  function init() {
    attach();

    const observer = new MutationObserver(() => {
      const bar = getBar();
      if (!bar) return;

      // CORREÇÃO: Usar apenas '[aria-hidden]' é mais seguro, pois o GWT costuma 
      // alternar esse atributo de "true" para "false". Se fixarmos em ="true", 
      // não o encontraremos quando o menu estiver aberto.
      const inner = bar.querySelector('[aria-hidden]');
      if (inner) {
        const isHidden = inner.style.display === 'none' || inner.getAttribute('aria-hidden') === 'true';
        const isVisible = !isHidden;

        if (isVisible && !isMenuOpen) {
          // GWT abriu sozinho — fechamos imediatamente para forçar a regra de clique
          closeMenu();
        } else if (!isVisible && isMenuOpen) {
          // CORREÇÃO CRÍTICA: GWT fechou nativamente (ex: usuário clicou em um link no menu).
          // Precisamos desmarcar nossa variável para que a barra volte a responder a cliques!
          isMenuOpen = false;
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'aria-hidden'], // O atributo aria-hidden foi adicionado aqui
    });
  }

  // Run as early as possible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();