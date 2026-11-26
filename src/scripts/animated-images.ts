export function initAnimatedImages(motion: MediaQueryList) {
  const images = new Map<HTMLImageElement, { source: string; visible: boolean }>();
  const update = (image: HTMLImageElement) => {
    const state = images.get(image)!;
    if (state.visible && !motion.matches) {
      if (image.dataset.paused === 'true') image.src = state.source;
      image.dataset.paused = 'false';
      return;
    }
    if (image.dataset.paused === 'true' || !image.complete || !image.naturalWidth) return;
    if (image.dataset.animatedPoster) {
      image.src = image.dataset.animatedPoster;
      image.dataset.paused = 'true';
      return;
    }
    // Original GIFs without a supplied poster retain a full-resolution still.
    try {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      canvas.getContext('2d')!.drawImage(image, 0, 0);
      image.src = canvas.toDataURL('image/png');
      image.dataset.paused = 'true';
    } catch { /* Keep the original image when a snapshot cannot be made. */ }
  };
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    const image = entry.target as HTMLImageElement;
    images.get(image)!.visible = entry.isIntersecting;
    update(image);
  }));
  document.querySelectorAll<HTMLImageElement>('img[data-animated], img[src*=".gif"]').forEach(image => {
    images.set(image, { source: image.src, visible: false });
    image.dataset.animatedSource = image.src;
    if (image.complete) observer.observe(image);
    else image.addEventListener('load', () => observer.observe(image), { once: true });
  });
  motion.addEventListener('change', () => images.forEach((_, image) => update(image)));
}
