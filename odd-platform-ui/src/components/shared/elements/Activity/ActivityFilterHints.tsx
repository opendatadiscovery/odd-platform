import React from 'react';
import { useTranslation } from 'react-i18next';
import AppTooltip from 'components/shared/elements/AppTooltip/AppTooltip';
import { InformationIcon } from 'components/shared/icons';

// Inline "(i)" help for the three activity actor/asset filters. ODD distinguishes the external USER
// (immutable, recorded on each event) from the internal OWNER (reached via a mutable user<->owner
// association), and the asset OWNER (who owns the affected entity). Shared by the global Activity page
// and the per-entity Activity tab (#1657 / CTRIB-010).
//
// Reuses the platform's established inline-help affordance (ADR-0076): an InformationIcon wrapped in an
// AppTooltip — the same pattern as the Data Entity overview "About" block (InternalDescriptionHeader),
// Term definitions, and the DQ SLA report. Do NOT introduce a parallel popover for this.
const FilterHint: React.FC<{ content: string }> = ({ content }) => (
  <AppTooltip title={content} checkForOverflow={false}>
    <InformationIcon width={14} height={14} />
  </AppTooltip>
);

export const OwnerFilterHint: React.FC = () => {
  const { t } = useTranslation();
  return (
    <FilterHint
      content={t(
        'Filters to changes on data entities that the selected owner owns - the owner of the affected asset, not the person who made the change.'
      )}
    />
  );
};

export const MadeByOwnerFilterHint: React.FC = () => {
  const { t } = useTranslation();
  return (
    <FilterHint
      content={t(
        'Filters to changes made by users currently associated with the selected owner. ODD maps each user to an owner, and this filter uses that current association - re-associating an owner changes which past changes match.'
      )}
    />
  );
};

export const MadeByUserFilterHint: React.FC = () => {
  const { t } = useTranslation();
  return (
    <FilterHint
      content={t(
        'Filters to changes made by the selected user, identified by their external username. This is stable over time and works even for users who have no owner association.'
      )}
    />
  );
};
