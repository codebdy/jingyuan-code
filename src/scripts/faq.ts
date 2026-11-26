export function initFaq() {
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-faq-toggle]')];
  const setters = new Map<HTMLButtonElement, (open: boolean) => void>();
  buttons.forEach((button, index) => {
    const row = button.closest<HTMLElement>('[data-faq-row]');
    const heading = button.parentElement;
    if (!row || !heading) return;
    const panel = document.createElement('div');
    panel.className = 'faq-answer-panel';
    panel.id = `faq-answer-${index}`;
    const inner = document.createElement('div');
    inner.className = 'faq-answer-clip';
    const content = document.createElement('div');
    content.className = 'faq-answer-content';
    [...row.children].filter(child => child !== heading).forEach(child => content.append(child));
    inner.append(content); panel.append(inner); row.append(panel);
    row.dataset.faqAnimated = '';
    button.setAttribute('aria-controls', panel.id);
    const set = (open: boolean) => {
      if (open && !content.textContent?.trim()) {
        const p = document.createElement('p');
        p.className = 'faq-request';
        p.textContent = 'Please contact our team for product-specific guidance.';
        const link = document.createElement('a');
        link.href = '/contact/'; link.textContent = ' Send Inquiry →';
        p.append(link); content.append(p);
      }
      button.setAttribute('aria-expanded', String(open));
      row.dataset.open = String(open);
      panel.inert = !open;
      panel.setAttribute('aria-hidden', String(!open));
    };
    setters.set(button, set);
    set(button.getAttribute('aria-expanded') === 'true');
    heading.addEventListener('click', event => {
      if (!(event.target as Element).closest('[data-faq-toggle]')) button.click();
    });
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      if (open) setters.forEach((close, other) => { if (other !== button) close(false); });
      set(open);
    });
  });
}
