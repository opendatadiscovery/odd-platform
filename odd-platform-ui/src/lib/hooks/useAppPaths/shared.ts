export const EMBEDDED = 'embedded';

export const ActivityRoutes = {
  activity: 'activity',
} as const;

export const SearchRoutes = {
  search: 'search',
  searchId: 'searchId',
  searchIdParam: ':searchId',
} as const;

export const TermsRoutes = {
  termSearch: 'termsearch',
  terms: 'terms',
  termSearchId: 'termSearchId',
  termSearchIdParam: ':termSearchId',
  termId: 'termId',
  termIdParam: ':termId',
  termsViewType: 'termsViewType',
  termsViewTypeParam: ':termsViewType',
  overview: 'overview',
  linkedEntities: 'linked-entities',
  linkedColumns: 'linked-columns',
} as const;
