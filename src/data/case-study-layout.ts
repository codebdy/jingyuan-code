// Keep the Figma content and card dimensions; give its boxless summary a real sticky
// containing block bounded by the final two-column detail section (the gallery).
export function createCaseStudyLayout(source: any) {
  const root = structuredClone(source);
  const info = root.children.find((node: any) => node.attrs?.['data-node-id'] === '251:95');
  const gallery = root.children.find((node: any) => node.attrs?.['data-slot-id'] === '269:585');
  if (!info || !gallery) return root;
  const units = (value: string) => Number(value?.match(/calc\(([-\d.]+) \* var\(--u\)\)/)?.[1] ?? 0);
  const start = units(info.children[0].style.top);
  const end = units(gallery.style.top) + units(gallery.style.height);
  const copy = info.children[1];
  copy.style = { ...copy.style, position: 'relative', left: 'auto', top: 'auto', width: '100%' };
  const sidebar = {
    tag: 'aside', attrs: { 'data-case-sidebar-track': '', 'aria-label': 'Project information' },
    style: { position: 'absolute', left: 'calc(120 * var(--u))', top: `calc(${start} * var(--u))`, width: 'calc(540 * var(--u))', height: `calc(${end - start} * var(--u))` },
    children: [{ tag: 'div', attrs: { 'data-case-summary': '', 'data-reveal-card': '' }, children: [copy] }],
  };
  const detailSlots = new Set(['252:121', '252:135', '265:213', '265:263', '269:538', '265:268', '269:585']);
  root.children = root.children.flatMap((node: any) => {
    const id = node.attrs?.['data-node-id'];
    if (id === '251:95') return [sidebar];
    if (id === '269:597') return []; // The imported canvas contains an overlapping duplicate.
    if (detailSlots.has(node.attrs?.['data-slot-id'])) node.attrs['data-case-detail-column'] = '';
    if (id === '269:769') node.children.forEach((child: any) => child.attrs['data-case-detail-column'] = '');
    return [node];
  });
  return root;
}
