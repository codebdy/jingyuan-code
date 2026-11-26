export const productPath = (model: string) => `/products/${model.toLowerCase().replace(/×/g, 'x').replace(/\./g, '-')}/`;
