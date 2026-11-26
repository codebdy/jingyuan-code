// Figma cards that have no catalog/news/certificate semantics of their own.
const groups: Record<string, string[]> = {
  'category-applications': ['275:2007', '275:2114', '275:2042', '275:2078'],
  'about-applications': ['356:163', '356:270', '356:198', '356:234'],
  'selection-steps': ['280:36', '280:44', '280:51', '280:58', '280:65', '280:72'],
  'product-benefits': ['275:1887', '275:1895', '275:1902', '275:1911'],
  'project-requirements': ['265:161', '265:181', '265:167', '265:189'],
  'project-solutions': ['265:238', '265:239', '265:246', '265:253'],
  'project-execution': ['269:438', '269:512', '269:520', '269:528'],
  'project-outcomes': ['269:645', '269:651'],
  'product-applications': ['300:798', '300:801', '300:804', '300:807'],
  'product-manufacturing': ['300:862', '372:103', '305:8', '305:14', '305:20', '305:26'],
  'factory-equipment': ['310:1141', '310:1176', '310:1189'],
  'factory-process': ['316:1410', '316:1411', '316:1422', '316:1431', '316:1440'],
  'factory-inspection': ['326:7', '326:14', '326:17', '326:20', '326:23'],
  'service-benefits': ['367:49', '367:57', '367:66', '367:74'],
  'service-options': ['372:169', '375:199', '372:191', '375:207'],
  'service-process': ['377:3', '377:94', '377:105', '377:116', '377:127', '377:138'],
  'contact-methods': ['382:804', '382:807', '382:810', '382:813'],
};
export const cardGroupById = new Map(Object.entries(groups).flatMap(([group, ids]) => ids.map(id => [id, group] as const)));
