import type { OptionalFacetNames } from 'redux/interfaces';

/**
 * Single source of truth for how a facet value is displayed in the search filters.
 *
 * We render the RAW value so a selected chip and its sidebar dropdown option always
 * agree (#1835): the dropdown never applied `capitalize`, but the chip did — so the
 * `DataEntityStatus` value `DRAFT` showed as `Draft` in the chip while the dropdown
 * showed `DRAFT`. Statuses (DRAFT / STABLE / DEPRECATED) render verbatim; only `types`
 * values are made readable with underscore -> space (DATA_SET -> "DATA SET"), matching
 * the dropdown's existing behaviour. Returns '' for a missing name (renders nothing).
 */
const formatFacetName = (
  facetName: OptionalFacetNames,
  name: string | undefined
): string => {
  if (!name) return '';
  return facetName === 'types' ? name.replaceAll('_', ' ') : name;
};

export default formatFacetName;
