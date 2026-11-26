// Measured line masks keep the original typography, wrapping and layout intact.
// The temporary visual copies are hidden from assistive technology and removed
// after playback; the original text remains the sole accessible heading.
export function initTitleReveal() {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || !('IntersectionObserver' in window)) return;
  const titles = Array.from(document.querySelectorAll<HTMLElement>([
    '#products-title', '#solutions-title', '[data-title-reveal-after]',
    '#manufacturing-title', '#application-title', '#about-title',
    '.story-copy h3', '#news-title', '#contact-title',
    '.design-canvas [data-title-reveal]',
  ].join(','))).filter(title => title.textContent?.trim() && !title.parentElement?.closest('[data-title-reveal]') && !title.closest(
    '#hero-title, dialog, [data-content-reveal-root], [data-counter], [aria-hidden="true"], [data-catalog-card], [data-case-card], [data-news-card], [data-product-preview], [role="button"]',
  ));
  if (!titles.length) return;
  const preset = getComputedStyle(document.documentElement);
  const duration = parseFloat(preset.getPropertyValue('--title-reveal-duration')) || 1000;
  const stagger = parseFloat(preset.getPropertyValue('--title-reveal-stagger')) || 100;
  const timers = new Map<HTMLElement, ReturnType<typeof setTimeout>>();
  const starts = new Map<HTMLElement, number>();
  const sources = new Map<HTMLElement, HTMLElement>();
  const finish = (title: HTMLElement) => {
    clearTimeout(timers.get(title)); timers.delete(title);
    title.dataset.titleRevealState = 'complete';
    const source = sources.get(title);
    if (source?.parentElement === title) title.replaceChildren(...source.childNodes);
    sources.delete(title);
    delete title.dataset.titleLines;
    delete title.dataset.titlePositioned;
    title.style.removeProperty('--title-reveal-delay');
  };
  const prepare = (title: HTMLElement) => {
    const box = title.getBoundingClientRect();
    if (!box.width || !box.height) return false;
    const style = getComputedStyle(title);
    const rows: { top: number; bottom: number }[] = [];
    const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      for (const word of node.textContent?.matchAll(/\S+/g) ?? []) {
        const range = document.createRange();
        range.setStart(node, word.index!); range.setEnd(node, word.index! + word[0].length);
        for (const rect of range.getClientRects()) {
          if (!rect.width || !rect.height) continue;
          const row = rows.find(row => Math.abs(row.top - rect.top) < 3);
          if (row) row.bottom = Math.max(row.bottom, rect.bottom);
          else rows.push({ top: rect.top, bottom: rect.bottom });
        }
      }
    }
    rows.sort((a, b) => a.top - b.top);
    if (!rows.length) return false;
    const source = document.createElement('reveal-source');
    source.append(...title.childNodes);
    title.append(source); sources.set(title, source);
    if (style.position === 'static') title.dataset.titlePositioned = '';
    const borderTop = parseFloat(style.borderTopWidth) || 0;
    const paddingLeft = parseFloat(style.paddingLeft) || 0;
    const paddingRight = parseFloat(style.paddingRight) || 0;
    rows.forEach((row, i) => {
      const top = (i ? (rows[i - 1].bottom + row.top) / 2 : Math.min(box.top, row.top)) - box.top - borderTop;
      const bottom = (i < rows.length - 1 ? (row.bottom + rows[i + 1].top) / 2 : Math.max(box.bottom, row.bottom)) - box.top - borderTop;
      const mask = document.createElement('reveal-line-mask');
      const line = document.createElement('reveal-line');
      const content = document.createElement('reveal-line-content');
      mask.setAttribute('aria-hidden', 'true');
      mask.style.cssText = `top:${top}px;left:${paddingLeft}px;right:${paddingRight}px;height:${bottom - top}px`;
      line.style.cssText = `--line-reveal-distance:${bottom - top}px;--line-reveal-order:${i}`;
      content.style.top = `${-top}px`;
      content.append(...Array.from(source.childNodes, child => child.cloneNode(true)));
      // Imported headings may contain marked inline nodes: copies are paint only.
      content.querySelectorAll('*').forEach(copy => {
        for (const attr of [...copy.attributes]) if (attr.name === 'id' || attr.name.startsWith('data-') || attr.name.startsWith('aria-')) copy.removeAttribute(attr.name);
      });
      line.append(content); mask.append(line); title.append(mask);
    });
    title.dataset.titleLines = String(rows.length);
    return true;
  };
  const reveal = (title: HTMLElement) => {
    if (title.dataset.titleRevealState !== 'pending' || !sources.has(title)) return;
    observer.unobserve(title);
    let delay = 0;
    const leadId = title.dataset.titleRevealAfter;
    const lead = leadId ? document.getElementById(leadId) : null;
    if (lead && sources.has(lead)) {
      reveal(lead);
      delay = Math.max(0, (starts.get(lead) ?? 0) + 220 - performance.now());
    }
    starts.set(title, performance.now() + delay);
    title.style.setProperty('--title-reveal-delay', `${delay}ms`);
    title.dataset.titleRevealState = 'revealing';
    timers.set(title, setTimeout(() => finish(title), duration + delay + (Number(title.dataset.titleLines) - 1) * stagger + 80));
  };
  const observer = new IntersectionObserver(entries => {
    entries.filter(entry => entry.isIntersecting).forEach(entry => reveal(entry.target as HTMLElement));
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0 });
  const finishAll = () => { observer.disconnect(); titles.forEach(finish); };
  titles.forEach(title => title.dataset.titleRevealState = 'pending');
  // A missing/slow font must never leave readable content hidden indefinitely.
  const startup = setTimeout(finishAll, 2500);
  void document.fonts.ready.then(() => {
    clearTimeout(startup);
    titles.forEach(title => {
      if (motion.matches || title.dataset.titleRevealState !== 'pending') return;
      try { if (prepare(title)) observer.observe(title); else finish(title); }
      catch { finish(title); }
    });
  }).catch(finishAll);
  let scrollFrame = false;
  addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = true;
    requestAnimationFrame(() => {
      scrollFrame = false;
      titles.forEach(title => {
        if (title.dataset.titleRevealState === 'pending' && title.getBoundingClientRect().bottom < 0) {
          observer.unobserve(title); finish(title);
        }
      });
    });
  }, { passive: true });
  // Restore the real text immediately during reflow instead of retaining stale masks.
  addEventListener('resize', finishAll, { once: true });
  motion.addEventListener('change', () => { if (motion.matches) finishAll(); });
  addEventListener('beforeprint', finishAll);
}
