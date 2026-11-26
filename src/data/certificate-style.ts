import about from './design/about.json';

function find(node: any, id: string): any {
  if (!node || typeof node === 'string') return;
  if (node.attrs?.['data-node-id'] === id) return node;
  for (const child of node.children ?? []) { const result = find(child, id); if (result) return result; }
}
const reference = find(about.root, '356:412');

// Reuse the supplied certificate card, including its image, date, typography
// and spacing. Sample content will be replaced when actual documents arrive.
export function certificateCard(width: number) {
  const card = structuredClone(reference);
  function clean(node: any) {
    if (typeof node === 'string') return;
    if (node.attrs?.['data-node-id'] === '356:413') node.attrs['data-certificate-image-frame'] = '';
    delete node.attrs?.['data-node-id'];
    if (node.tag === 'img') {
      node.attrs.alt = 'Sample certificate layout';
      node.attrs['aria-label'] = 'View sample certificate layout';
    }
    (node.children ?? []).forEach(clean);
  }
  clean(card);
  card.attrs['data-cert-card'] = 'Sample certificate layout';
  card.attrs['data-unified-product-certificate'] = '';
  card.style.width = `calc(${width} * var(--u))`;
  card.style.marginLeft = '0'; card.style.marginTop = '0';
  return card;
}
