import { RelationshipsType } from 'generated-sources';

// The ?type= search param arrives as a raw string from deep links; an unknown value must
// degrade to the ALL view (the tab strip's own default) instead of propagating to the API
// as an enum-bind 400 that renders like an empty catalog (#1752).
export const parseRelationshipsType = (raw: string | null): RelationshipsType =>
  Object.values(RelationshipsType).includes(raw as RelationshipsType)
    ? (raw as RelationshipsType)
    : RelationshipsType.ALL;
