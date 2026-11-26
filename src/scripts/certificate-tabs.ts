import { softenSwap } from './motion-feedback';
import { certificateCategories } from '../data/certificate-categories';

export function initCertificateTabs() {
  const page = document.querySelector<HTMLElement>('.design-canvas')?.dataset.page;
  const panelId = page === 'quality-manufacturing' ? '326:137' : page === 'certifications' ? '356:982' : '';
  const panel = document.querySelector<HTMLElement>(`[data-node-id="${panelId}"]`);
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-certificate-filter]')];
  if (!panel || !buttons.length) return;
  const cards = [...panel.querySelectorAll<HTMLElement>('[data-cert-card]')];
  cards.forEach(card => {
    const frame = card.querySelector('img[data-lightbox]')?.closest<HTMLElement>('[data-node-id]');
    if (frame) frame.dataset.certificateImageFrame = '';
  });
  const originals = cards.map(card => card.innerHTML);
  panel.dataset.certificateGallery = '';
  panel.id = 'certificate-content';
  panel.setAttribute('role', 'tabpanel');
  const list = buttons[0].parentElement!.parentElement!;
  list.setAttribute('role', 'tablist');
  list.setAttribute('aria-label', 'Certificate categories');
  list.setAttribute('aria-orientation', 'vertical');
  const status = document.createElement('p');
  status.className = 'certificate-empty';
  status.setAttribute('role', 'status');
  panel.append(status);
  const select = (index: number) => {
    const category = certificateCategories[index];
    buttons.forEach((button, i) => {
      button.setAttribute('aria-selected', String(i === index));
      button.setAttribute('aria-pressed', String(i === index));
      button.tabIndex = i === index ? 0 : -1;
      button.parentElement!.dataset.certificateSelected = String(i === index);
    });
    panel.setAttribute('aria-labelledby', buttons[index].id);
    panel.dataset.certificateCategory = category.id;
    let count = 0;
    const initial = !panel.dataset.certificateInitialized;
    cards.forEach((card, i) => {
      const original = category.documents === 'original-product-certificates';
      const document = original ? null : category.documents[i];
      const placeholder = !original && !document;
      const visible = true;
      card.dataset.certificateVisible = String(visible);
      card.dataset.certificatePlaceholder = String(placeholder);
      card.inert = false;
      card.setAttribute('aria-hidden', String(!visible));
      if (!visible) return;
      count++;
      const image = card.querySelector<HTMLImageElement>('img[data-lightbox]')!;
      card.querySelectorAll<HTMLElement>('p').forEach(p => { p.style.visibility = ''; if (p.parentElement) p.parentElement.style.visibility = ''; });
      image.tabIndex = 0;
      image.setAttribute('role', 'button');
      // Restore content in place, preserving image listeners and card geometry.
      if (!document && card.dataset.certificateCustom === 'true') {
        const template = window.document.createElement('template');
        template.innerHTML = originals[i];
        const source = template.content;
        card.querySelectorAll('p').forEach((p, j) => p.textContent = source.querySelectorAll('p')[j]?.textContent ?? '');
        const img = card.querySelector<HTMLImageElement>('img[data-lightbox]')!;
        const originalImage = source.querySelector<HTMLImageElement>('img[data-lightbox]')!;
        img.src = originalImage.src;
        img.alt = originalImage.alt;
        img.setAttribute('aria-label', originalImage.getAttribute('aria-label') || 'View certificate');
        card.dataset.certificateCustom = 'false';
      }
      if (placeholder) {
        image.alt = 'Sample certificate layout; actual document to be updated';
        image.setAttribute('aria-label', 'View sample certificate layout');
      }
      if (document) {
        const img = card.querySelector<HTMLImageElement>('img[data-lightbox]')!;
        img.src = document.image; img.alt = document.title;
        img.setAttribute('aria-label', 'View ' + document.title);
        const text = card.querySelectorAll('p');
        [document.validity, document.title, document.description].forEach((value, j) => { if (text[j]) text[j].textContent = value; });
        card.dataset.certificateCustom = 'true';
      }
    });
    panel.dataset.certificateEmpty = String(count === 0);
    status.hidden = count > 0;
    status.textContent = count ? '' : `${category.label}: documents pending upload.`;
    if (!initial) softenSwap(panel);
    panel.dataset.certificateInitialized = 'true';
  };
  buttons.forEach((button, i) => {
    button.id = 'certificate-tab-' + certificateCategories[i].id;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', panel.id);
    button.parentElement!.dataset.certificateTabRow = '';
    // The plus and the full background also activate the category.
    button.parentElement!.addEventListener('click', () => select(i));
    button.addEventListener('keydown', event => {
      const next = event.key === 'ArrowDown' ? (i + 1) % buttons.length : event.key === 'ArrowUp' ? (i + buttons.length - 1) % buttons.length : event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : -1;
      if (next < 0) return;
      event.preventDefault(); buttons[next].focus(); select(next);
    });
  });
  select(0);
}
