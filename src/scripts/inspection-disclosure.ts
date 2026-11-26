export function initInspectionDisclosure(scope: HTMLElement | null) {
  const labels = ['Product Sampling','Dimensional Inspection','Electrical Testing','Performance Verification','Inspection Records'];
  labels.forEach((label, index) => {
    const heading = [...scope?.querySelectorAll<HTMLElement>('p') ?? []].find(node => node.textContent?.trim() === label);
    const body = heading?.nextElementSibling as HTMLElement | null;
    if (!heading || !body) return;
    const panel = document.createElement('div'), clip = document.createElement('div'), content = document.createElement('div');
    panel.className = 'inspection-disclosure'; clip.className = 'inspection-disclosure-clip'; content.className = 'inspection-disclosure-content';
    panel.id = 'inspection-description-' + index;
    body.before(panel); content.append(body); clip.append(content); panel.append(clip);
    heading.parentElement!.dataset.inspectionDisclosure = '';
    heading.tabIndex = 0; heading.setAttribute('role', 'button'); heading.setAttribute('aria-expanded', 'true');
    heading.setAttribute('aria-controls', panel.id); panel.dataset.open = 'true';
    const toggle = () => {
      const open = heading.getAttribute('aria-expanded') !== 'true';
      heading.setAttribute('aria-expanded', String(open)); panel.dataset.open = String(open);
      panel.inert = !open; panel.setAttribute('aria-hidden', String(!open));
    };
    heading.addEventListener('click', toggle);
    heading.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(); } });
  });
}
