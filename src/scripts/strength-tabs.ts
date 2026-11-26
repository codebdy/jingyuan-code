import { softenSwap } from './motion-feedback';
import strengths from '../data/strengths.json';

export function initStrengthTabs() {
  if (document.querySelector<HTMLElement>('.design-canvas')?.dataset.page !== 'about') return;
  const byId = (id: string) => document.querySelector<HTMLElement>(`[data-node-id="${id}"]`);
  const row = byId('356:43'), info = byId('356:34');
  const numbers = ['355:14','355:20','355:23','355:26'].map(byId);
  if (!row || !info || numbers.some(number => !number)) return;
  const columns = [...row.children] as HTMLElement[];
  const body = document.createElement('div');
  body.className = 'strength-content'; body.dataset.strengthBody = '';
  row.dataset.strengthRow = '';
  info.id = 'strength-description'; info.setAttribute('role', 'region');
  const title = byId('356:31')!, description = byId('356:32')!, tags = byId('356:75')!;
  let selected = 2;
  const copy = (index: number) => {
    const item = strengths[index];
    title.textContent = item.title; description.textContent = item.description; tags.textContent = item.tags;
  };
  const select = (index: number, animate = true) => {
    selected = (index + numbers.length) % numbers.length;
    columns.forEach((column, i) => {
      column.replaceChildren();
      column.dataset.strengthColumn = '';
      column.dataset.strengthExpanded = String(i === selected);
      column.style.removeProperty('grid-template-columns');
      column.style.removeProperty('grid-template-rows');
      column.style.removeProperty('place-items');
      column.style.lineHeight = 'normal';
      Object.assign(column.style, { display: 'flex', flexDirection: 'column', alignItems: 'stretch', position: 'relative', width: `calc(${i === selected ? 740 : 280} * var(--u))`, flex: 'none' });
      const rule = document.createElement('div'); rule.className = 'strength-rule'; column.append(rule);
      const number = numbers[i]!;
      number.setAttribute('aria-pressed', String(i === selected));
      number.setAttribute('aria-expanded', String(i === selected));
      if (i === selected) { body.replaceChildren(number, info!); column.append(body); }
      else column.append(number);
    });
    copy(selected);
    info!.setAttribute('aria-labelledby', numbers[selected]!.id);
    if (animate) softenSwap(info);
  };
  numbers.forEach((number, i) => {
    number!.dataset.strengthChoice = '';
    number!.id = 'strength-choice-' + (i + 1);
    number!.tabIndex = 0;
    number!.setAttribute('role', 'button');
    number!.setAttribute('aria-label', 'Show strength ' + (i + 1));
    number!.setAttribute('aria-controls', info.id);
    Object.assign(number!.style, { minWidth: '0', width: 'auto', flex: '0 0 auto' });
    number!.addEventListener('click', () => select(i));
    number!.addEventListener('keydown', event => {
      const next = event.key === 'ArrowRight' ? i + 1 : event.key === 'ArrowLeft' ? i - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? 3 : ['Enter',' '].includes(event.key) ? i : null;
      if (next === null) return;
      event.preventDefault(); select(next); numbers[selected]!.focus({ preventScroll: true });
    });
  });
  [...byId('356:148')?.children ?? []].forEach((button, i) => {
    const arrow = button as HTMLElement;
    arrow.tabIndex = 0; arrow.setAttribute('role', 'button'); arrow.setAttribute('aria-label', i ? 'Next strength' : 'Previous strength');
    const go = () => select(selected + (i ? 1 : -1));
    arrow.addEventListener('click', go);
    arrow.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); go(); } });
  });
  select(2, false);
  // Reserve the tallest supplied text at this width so changing copy cannot
  // push the next section down; every number uses the same expanded panel.
  let previousWidth = 0;
  const reserveHeight = () => {
    if (innerWidth > 800) {
      const number = numbers[2]!;
      number.style.setProperty('width', 'auto', 'important');
      const numberWidth = number.getBoundingClientRect().width / (innerWidth / 1920);
      number.style.removeProperty('width');
      row.style.setProperty('--strength-number-width', `calc(${numberWidth} * var(--u))`);
    }
    info.style.removeProperty('min-height');
    let height = 0;
    strengths.forEach((_, i) => { copy(i); height = Math.max(height, info.getBoundingClientRect().height); });
    copy(selected); info.style.setProperty('min-height', height + 'px', 'important');
  };
  void document.fonts.ready.then(reserveHeight);
  new ResizeObserver(entries => {
    const width = entries[0].contentRect.width;
    if (Math.abs(width - previousWidth) < .5) return;
    previousWidth = width; reserveHeight();
  }).observe(info);
}
