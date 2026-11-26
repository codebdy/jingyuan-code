export function initQualityStepHover() {
  const byId = (id: string) => document.querySelector<HTMLElement>(`[data-node-id="${id}"]`);
  const grid = byId('322:1891');
  if (!grid) return;
  const paints = ['322:1883','322:1884','322:1885','322:1886','322:1887'].map(byId);
  const captions = ['322:1590','322:1873','322:1876','322:1879','322:1882'].map(byId);
  const images = ['322:1583','322:1871','322:1874','322:1877','322:1880'].map(byId);
  const hover = matchMedia('(hover:hover) and (pointer:fine)');
  const select = (index: number) => {
    paints.forEach((paint, i) => paint?.style.setProperty('background', i === index ? '#e0452d' : '#bababa', 'important'));
    captions.forEach((caption, i) => { if (caption) caption.dataset.qualityHovered = String(i === index); });
  };
  for (let i = 0; i < 5; i++) {
    if (images[i]) {
      images[i]!.dataset.revealCard = '';
      images[i]!.dataset.revealGroup = 'quality-checks';
    }
    const hit = document.createElement('span');
    hit.className = 'quality-step-hit';
    hit.setAttribute('aria-hidden', 'true');
    hit.style.left = `calc(${i * 336} * var(--u))`;
    hit.addEventListener('pointerenter', () => { if (hover.matches) select(i); });
    grid.append(hit);
    [images[i], captions[i]].forEach(node => {
      node?.addEventListener('pointerenter', () => { if (hover.matches) select(i); });
      node?.addEventListener('pointerleave', () => select(-1));
    });
  }
  grid.addEventListener('pointerleave', () => select(-1));
  hover.addEventListener('change', () => select(-1));
  select(-1);
}
