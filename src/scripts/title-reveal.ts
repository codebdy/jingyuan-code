// Match Cleo's heading reveal: opacity over 1.2s, then a 6px blur clears
// over 1.2s after a 0.2s delay. Only paint changes; text layout stays intact.
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

  const timers = new Map<HTMLElement, ReturnType<typeof setTimeout>>();
  const starts = new Map<HTMLElement, number>();
  const finish = (title: HTMLElement) => {
    clearTimeout(timers.get(title));
    timers.delete(title);
    title.dataset.titleRevealState = 'complete';
    title.style.removeProperty('--title-reveal-delay');
  };
  const reveal = (title: HTMLElement) => {
    if (title.dataset.titleRevealState !== 'pending') return;
    observer.unobserve(title);
    let delay = 0;
    const leadId = title.dataset.titleRevealAfter;
    const lead = leadId ? document.getElementById(leadId) : null;
    if (lead && titles.includes(lead)) {
      reveal(lead);
      delay = Math.max(0, (starts.get(lead) ?? 0) + 320 - performance.now());
    }
    starts.set(title, performance.now() + delay);
    title.style.setProperty('--title-reveal-delay', `${delay}ms`);
    title.dataset.titleRevealState = 'revealing';
    timers.set(title, setTimeout(() => finish(title), 1700 + delay));
  };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const title = entry.target as HTMLElement;
      reveal(title);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });

  titles.forEach(title => {
    title.dataset.titleRevealState = 'pending';
    title.addEventListener('animationend', event => {
      if (event.target === title && event.animationName === 'title-reveal-sharp') finish(title);
    });
    observer.observe(title);
  });

  const finishAll = () => {
    observer.disconnect();
    titles.forEach(finish);
  };
  motion.addEventListener('change', () => { if (motion.matches) finishAll(); });
  addEventListener('beforeprint', finishAll);
}
