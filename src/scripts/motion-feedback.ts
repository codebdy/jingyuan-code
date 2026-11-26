const swaps = new WeakMap<HTMLElement, Animation>();
export function softenSwap(element: HTMLElement | null) {
  if (!element || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  swaps.get(element)?.cancel();
  const animation = element.animate([{ opacity: .35 }, { opacity: 1 }], { duration: 360, easing: 'ease-out' });
  swaps.set(element, animation);
  void animation.finished.then(() => swaps.delete(element)).catch(() => {});
}

// Reveal supporting copy and standalone visuals with the existing card preset.
// Never animate hero backgrounds, image fragments, controls or nested cards twice.
export function initSectionFeedback() {
  document.querySelectorAll<HTMLElement>('[data-cert-card]').forEach(card => {
    const image = card.querySelector('img[data-lightbox="certificate"]');
    const frame = image?.closest<HTMLElement>('[data-certificate-image-frame]') ?? image?.closest<HTMLElement>('[data-node-id]');
    if (frame) frame.dataset.certificateImageFrame = '';
  });
  const cardSelector = '[data-reveal-card],[data-catalog-card],[data-card-hover],[data-cert-card],[data-news-card],[data-case-card],[data-faq-row],.product-card,.solution-card,.news-card,.process';
  document.querySelectorAll<HTMLElement>(cardSelector).forEach(card => {
    if (!card.querySelector('a,button,[role=button]') || card.matches('[data-faq-row],.process')) return;
    card.dataset.cardFeedback = '';
    const title = [...card.querySelectorAll<HTMLElement>('h2,h3,p')].find(node => !node.closest('[data-action]') && (node.textContent?.length ?? 0) < 120 && (parseFloat(node.style.getPropertyValue('--design-font')) || parseFloat(getComputedStyle(node).fontSize)) >= 18);
    if (title) title.dataset.cardFeedbackTitle = '';
  });
  document.querySelectorAll<HTMLElement>('.design-canvas [data-image-stage]').forEach(stage => {
    if (stage.closest(cardSelector + ',form,[data-certificate-gallery],.mobile-banner')) return;
    const width = parseFloat(stage.style.getPropertyValue('--image-native-width'));
    if (width < 200 || width > 1400 || !width) return;
    const rect = stage.getBoundingClientRect();
    if (rect.top + scrollY < 900 || stage.querySelector('[data-manufacturing-video]')) return;
    stage.dataset.revealBlock = '';
  });
  document.querySelectorAll<HTMLElement>('.design-canvas h2,[data-home] section h2').forEach(heading => {
    if (heading.closest(cardSelector + ',form,dialog')) return;
    const parent = heading.parentElement;
    [...parent?.children ?? []].forEach(child => {
      if (!child.matches('p') || (child.textContent?.trim().length ?? 0) < 40) return;
      (child as HTMLElement).dataset.revealBlock = '';
    });
  });
  // Imported decorative wrappers must not hide their newly interactive images.
  document.querySelectorAll<HTMLElement>('img[tabindex="0"]').forEach(image => {
    for (let parent = image.parentElement; parent && !parent.matches('main,body'); parent = parent.parentElement) {
      if (parent.getAttribute('aria-hidden') === 'true') parent.removeAttribute('aria-hidden');
    }
  });
}
