export interface CertificateDocument { image: string; title: string; validity: string; description: string }
export interface CertificateCategory { id: string; label: string; documents: CertificateDocument[] | 'original-product-certificates' }
// Only CCC product certificates have been supplied. Add real uploaded documents
// to their category; never present CCC as a management-system certificate.
export const certificateCategories: CertificateCategory[] = [
  { id: 'quality', label: 'Quality Management System', documents: [] },
  { id: 'environment', label: 'Environmental Management System', documents: [] },
  { id: 'health-safety', label: 'Occupational Health & Safety Management System', documents: [] },
  { id: 'product', label: 'Product Certification', documents: 'original-product-certificates' },
  { id: 'inspection', label: 'Inspection & Test Reports', documents: [] },
];
