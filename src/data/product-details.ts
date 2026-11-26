import { products } from './home';
import { productPath } from './product-links';
import { certificateCard } from './certificate-style';

// All model pages use the supplied detail artboard, with existing catalog data.
// Unknown dimensions, resistance, standards and other unprovided data stay unfilled.
export function createProductDetails(template: any) {
  return products.map(product => {
    const page = structuredClone(template);
    page.slug = productPath(product.model).slice(1, -1);
    page.title = product.model;
    page.productModel = product.model;
    const variant = product.id !== 'yJV';
    const voltage = product.specs[0][1], conductor = 'Copper';
    const cores = product.specs[2][1], size = product.specs[3][1];
    const insulation = product.specs[4][1], sheath = product.specs[5][1];
    const purpose = product.id === 'mi'
      ? 'Specialized cable solutions for applications requiring defined fire-resistant performance.'
      : 'Designed for control circuits, signal transmission, and industrial systems.';
    const summary = `${product.type}: ${voltage}, ${cores}, ${size} copper conductors. Insulation: ${insulation}. Outer sheath: ${sheath}.`;
    page.description = variant ? `${product.model} — ${summary}` : `${product.model} low voltage power cable — 0.6/1kV, 3-Core copper conductors, 25 mm², XLPE insulation and PVC outer sheath.`;
    const text: Record<string, string> = {
      '273:1400': product.type, '273:1401': product.model,
      '275:1843': voltage, '273:1409': conductor, '273:1413': cores,
      '273:1417': size, '273:1421': insulation, '273:1425': sheath,
      '275:1849': 'Product Information', '273:1404': 'Technical Specifications',
      '300:409': voltage, '300:412': conductor, '300:415': insulation,
      '300:421': cores, '300:424': size, '300:427': sheath,
      '305:479': `Product name: ${product.model}`,
    };
    if (variant) Object.assign(text, {
      '298:34': `${purpose} ${summary}`, '298:42': product.type,
      '298:43': `${purpose} ${summary}`,
      '300:154': 'Core Configuration',
      '300:501': product.model.replace(/^JY-/, ''),
      '300:621': product.type, '300:653': voltage,
    });
    const fields: Record<string, string> = {
      'product-model': product.model, 'rated-voltage': voltage,
      'conductor-material': conductor, 'core-number': cores,
      'conductor-cross-section': size,
    };
    const photo = product.id === 'mi' ? '/figma/67f07b40c282-865b8.png' : '/figma/d69670b32ed4-2dcd5.png';
    const information: Record<string, string> = {
      'Eco-friendly material, no odor;': `Conductor: ${conductor};`,
      'Accurate weight tolerance;': `Core configuration: ${cores};`,
      'Color stripe make the plates easy for users identify the weight;': `Insulation: ${insulation};`,
      'Drop times 6000-20000;': `Outer sheath: ${sheath};`,
    };
    function visit(node: any, related = false, productImage = false) {
      if (typeof node === 'string') return node;
      const id = node.attrs?.['data-node-id'];
      if (['305:185','305:197','305:198','305:199'].includes(id)) return certificateCard(254);
      related ||= node.attrs?.['data-catalog-card'] !== undefined;
      productImage ||= id === '273:1394' || id === '300:192';
      if (text[id] !== undefined) node.children = [text[id]];
      if (id === '273:1417' || id === '300:424') node.style.textTransform = 'none';
      if (id === '275:1849' || id === '273:1404') node.attrs['data-product-spec-heading'] = '';
      if (['275:1849', '273:1404', '275:1850', '275:1845'].includes(id)) node.tag = 'span';
      if (id === '275:1850' || id === '275:1845') node.attrs['aria-hidden'] = 'true';
      if (id === '284:158') {
        node.attrs['data-product-purchase'] = '';
        node.style.gridTemplateRows = 'max-content max-content max-content';
      }
      if (id === '275:1869') node.attrs['data-product-accordions'] = '';
      if (['275:1870', '295:13', '295:14'].includes(id)) {
        node.style.gridRowStart = id === '295:14' ? 3 : 2;
        node.style.marginTop = '0';
        node.style['--native-margin-top'] = '0';
      }
      if (id === '275:1870' || id === '295:14') {
        node.tag = 'a';
        node.attrs['data-action'] = '';
        node.attrs[id === '275:1870' ? 'data-product-download' : 'data-product-inquiry'] = '';
        node.attrs.href = id === '275:1870' ? `/contact/?request=datasheet&product=${encodeURIComponent(product.model)}` : '#product-section-8';
      }
      if (id === '275:1871') node.attrs['data-product-download-paint'] = '';
      if (id === '295:15') node.attrs['data-product-inquiry-paint'] = '';
      if (id === '275:1873') {
        node.tag = 'span';
        delete node.attrs.href;
        delete node.attrs['data-design-link'];
        node.attrs['data-product-download-label'] = '';
      }
      if (id === '305:685') node.attrs.id = 'product-section-8';
      if (node.attrs?.['data-field'] !== undefined && fields[node.attrs.name]) node.attrs.value = fields[node.attrs.name];
      if (node.attrs?.href?.startsWith('/contact/') && !related && /Inquiry|Datasheet/i.test(JSON.stringify(node.children))) {
        const url = new URL(node.attrs.href, 'https://preview.invalid');
        url.searchParams.set('product', product.model);
        node.attrs.href = url.pathname + url.search;
      }
      if (variant && productImage && node.tag === 'img' && node.attrs?.['data-photo'] !== undefined) {
        node.attrs.src = photo;
        node.attrs.alt = `${product.model} ${product.type}`;
        const fit = { width: '100%', height: '100%', left: '0', top: '0', objectFit: 'contain' };
        Object.assign(node.style, fit);
        for (const [key, value] of Object.entries(fit)) node.style['--native-' + key.replace(/[A-Z]/g, m => '-' + m.toLowerCase())] = value;
        node.style.transform = product.id === 'kvv' ? 'scaleY(-1)' : 'none';
      }
      node.children = (node.children ?? []).map((child: any) => {
        if (!related && typeof child === 'string') {
          if (information[child.trim()]) return information[child.trim()];
        }
        if (variant && !related && typeof child === 'string') {
          const value = child.trim();
          if (value === 'Product Category: Power Cables') return `Product Category: ${product.type}`;
          if (value === 'Insulation Type: XLPE') return `Insulation Type: ${insulation}`;
          if (value === 'Conductor Material: Copper / Aluminum') return `Conductor Material: ${conductor}`;
          if (value === 'XLPE Insulation') return insulation;
          if (value === 'Armored Structure (Applicable Models)') return cores;
          if (value === 'Designed for power transmission and distribution in low-voltage electrical systems') return purpose;
        }
        return visit(child, related, productImage);
      });
      if (id === '275:1847' || id === '275:1817') {
        node.tag = 'details';
        node.attrs.open = true;
        node.attrs['data-product-accordion'] = '';
        const [heading, ...body] = node.children;
        heading.tag = 'summary';
        heading.attrs['data-product-accordion-toggle'] = '';
        node.children = [heading, {
          tag: 'div', attrs: { 'data-product-accordion-content': '' },
          style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' },
          children: body,
        }];
      }
      return node;
    }
    visit(page.root);
    // Full certificate captions need room below the former image-only strip.
    const extra = 77;
    for (const slot of page.root.children) {
      if (typeof slot === 'string') continue;
      if (slot.attrs?.['data-slot-id'] === '305:299') slot.style.height = `calc(${988 + extra} * var(--u))`;
      else if (slot.style?.position === 'absolute') {
        const top = /^calc\(([\d.]+) \* var\(--u\)\)$/.exec(slot.style.top ?? '');
        if (top && Number(top[1]) > 5212) slot.style.top = `calc(${Number(top[1]) + extra} * var(--u))`;
      }
    }
    page.height += extra;
    return page;
  });
}
