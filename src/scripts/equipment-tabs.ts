import { softenSwap } from './motion-feedback';
import { equipmentCategories } from '../data/equipment-categories';

const placeholder = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="520" height="365" viewBox="0 0 520 365"><rect width="520" height="365" fill="#e8e8e8"/><text x="260" y="183" text-anchor="middle" dominant-baseline="middle" fill="#868686" font-family="Arial,sans-serif" font-size="16">Equipment image pending upload</text></svg>');

export function initEquipmentTabs() {
  if (document.querySelector<HTMLElement>('.design-canvas')?.dataset.page !== 'quality-manufacturing') return;
  const byId = (id: string) => document.querySelector<HTMLElement>(`[data-node-id="${id}"]`);
  const section = byId('316:1257'), gallery = byId('310:1251'), description = byId('310:1249');
  if (!section || !gallery || !description) return;
  const controls = equipmentCategories.map(category => {
    const label = [...section.querySelectorAll<HTMLElement>('p')].find(node => node.textContent?.trim() === category.label);
    let control = label?.parentElement;
    while (control?.parentElement && getComputedStyle(control).backgroundColor === 'rgba(0, 0, 0, 0)') control = control.parentElement;
    return control;
  });
  if (controls.some(control => !control)) return;
  const slots = [
    ['310:1141', '310:1160', '310:1162', '310:1148', '310:1150', '310:1152'],
    ['310:1176', '310:1180', '310:1182', '310:1184', '310:1186', '310:1188'],
    ['310:1189', '310:1193', '310:1195', '310:1197', '310:1199', '310:1201'],
  ].map(([card, badge, tag, title, date, time]) => ({
    card: byId(card)!, image: byId(card)!.querySelector<HTMLImageElement>('img[data-photo]')!,
    badge: byId(badge)!, tag: byId(tag)!, title: byId(title)!, date: byId(date)!, time: byId(time)!,
  }));
  let tablist = controls[0]!.parentElement;
  while (tablist && !controls.every(control => tablist!.contains(control!))) tablist = tablist.parentElement;
  tablist?.setAttribute('role', 'tablist');
  tablist?.setAttribute('aria-label', 'Cable production equipment');
  gallery.id = 'equipment-content';
  gallery.setAttribute('role', 'tabpanel');
  let request = 0;
  const field = (node: HTMLElement, value: string | undefined, owner = node) => {
    // Hidden metadata keeps its reserved space until real content is provided.
    if (value) node.textContent = value;
    owner.style.visibility = value ? '' : 'hidden';
  };
  const select = async (index: number) => {
    const category = equipmentCategories[index], ticket = ++request;
    controls.forEach((control, i) => {
      control!.setAttribute('aria-pressed', String(i === index));
      control!.setAttribute('aria-selected', String(i === index));
      control!.tabIndex = i === index ? 0 : -1;
    });
    gallery.setAttribute('aria-busy', 'true');
    const images = await Promise.all(slots.map(async (_, i) => {
      const source = category.cards[i]?.image;
      if (!source) return placeholder;
      const image = new Image();
      image.src = source;
      try { await image.decode(); return source; } catch { return placeholder; }
    }));
    if (ticket !== request) return;
    description.textContent = category.description;
    slots.forEach((slot, i) => {
      const item = category.cards[i] ?? { image: '', title: '' };
      slot.image.src = images[i];
      slot.image.alt = images[i] === placeholder ? 'Equipment image pending upload' : item.title;
      slot.card.dataset.equipmentPlaceholder = String(images[i] === placeholder);
      slot.title.textContent = item.title || 'Pending upload';
      field(slot.badge, item.badge, slot.badge.parentElement!);
      field(slot.tag, item.tag, slot.tag.parentElement!);
      field(slot.date, item.date);
      field(slot.time, item.time);
      let metadata = slot.date.parentElement!;
      while (!metadata.contains(slot.time) && metadata !== slot.card) metadata = metadata.parentElement!;
      if (!metadata.contains(slot.title)) metadata.style.visibility = item.date || item.time ? '' : 'hidden';
    });
    gallery.dataset.equipmentCategory = category.id;
    gallery.setAttribute('aria-labelledby', controls[index]!.id);
    gallery.removeAttribute('aria-busy');
    softenSwap(gallery);
  };
  controls.forEach((control, i) => {
    control!.id = 'equipment-tab-' + equipmentCategories[i].id;
    control!.dataset.equipmentTab = '';
    control!.setAttribute('role', 'tab');
    control!.setAttribute('aria-label', equipmentCategories[i].label);
    control!.setAttribute('aria-controls', gallery.id);
    control!.setAttribute('aria-pressed', String(i === 0));
    control!.setAttribute('aria-selected', String(i === 0));
    control!.tabIndex = i === 0 ? 0 : -1;
    control!.addEventListener('click', () => { void select(i); });
    control!.addEventListener('keydown', event => {
      const next = event.key === 'ArrowRight' ? (i + 1) % controls.length : event.key === 'ArrowLeft' ? (i + controls.length - 1) % controls.length : event.key === 'Home' ? 0 : event.key === 'End' ? controls.length - 1 : ['Enter', ' '].includes(event.key) ? i : -1;
      if (next < 0) return;
      event.preventDefault();
      controls[next]!.focus();
      void select(next);
    });
  });
  // Initial DOM is the supplied first-category design; do not recreate its layout.
  gallery.dataset.equipmentCategory = equipmentCategories[0].id;
  gallery.setAttribute('aria-labelledby', controls[0]!.id);
}
