export interface EquipmentCard {
  image: string;
  title: string;
  badge?: string;
  tag?: string;
  date?: string;
  time?: string;
}
export interface EquipmentCategory {
  id: string;
  label: string;
  description: string;
  cards: EquipmentCard[];
}

// Each category fills the same three slots. Replace empty fields with uploaded content.
export const equipmentCategories: EquipmentCategory[] = [
  {
    id: 'low-voltage', label: 'Low-Voltage Cable Production',
    description: 'Dedicated equipment for low-voltage cable manufacturing, supporting the production of different cable configurations.',
    cards: ['/figma/105d49859760-bb165.png', '/figma/d3ac1deae89a-8fbbf.png', '/figma/fae272c15d96-6dd27.png'].map(image => ({
      image, title: 'Echoes of Expression', badge: 'Artist Talk', tag: '14+', date: 'Mar 22, 2025', time: '6 PM',
    })),
  },
  {
    id: 'fire-resistant', label: 'Fire-Resistant Cable Production',
    description: 'Dedicated equipment for fire-resistant cable manufacturing, supporting the production of different cable configurations.',
    cards: Array.from({ length: 3 }, () => ({ image: '', title: '' })),
  },
];
