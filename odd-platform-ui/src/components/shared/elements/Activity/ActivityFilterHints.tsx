import React from 'react';
import { useTranslation } from 'react-i18next';
import InformationHint from 'components/shared/elements/InformationHint/InformationHint';

// Inline "(i)" help for the three activity actor/asset filters. ODD distinguishes the external USER
// (immutable, recorded on each event) from the internal OWNER (reached via a mutable user<->owner
// association), and the asset OWNER (who owns the affected entity). Shared by the global Activity page
// and the per-entity Activity tab so the copy stays in one place (#1657 / CTRIB-010).

const ACTIVITY_DOCS = 'https://docs.opendatadiscovery.org/active-platform-features/activity-feed';

export const OwnerFilterHint: React.FC = () => {
  const { t } = useTranslation();
  return (
    <InformationHint
      ariaLabel={t('About the Owner filter')}
      title={t('Owner of the asset')}
      content={t(
        'Filters to changes on data entities that the selected owner owns - the owner of the affected asset, not the person who made the change.'
      )}
    />
  );
};

export const MadeByOwnerFilterHint: React.FC = () => {
  const { t } = useTranslation();
  return (
    <InformationHint
      ariaLabel={t('About the Made by (owner) filter')}
      title={t("The editor's current owner")}
      content={t(
        'Filters to changes made by users currently associated with the selected owner. ODD maps each user to an owner, and this filter uses that current association - re-associating an owner changes which past changes match.'
      )}
      links={[{ label: t('Learn more'), href: ACTIVITY_DOCS }]}
    />
  );
};

export const MadeByUserFilterHint: React.FC = () => {
  const { t } = useTranslation();
  return (
    <InformationHint
      ariaLabel={t('About the Made by (user) filter')}
      title={t('The user who made the change')}
      content={t(
        'Filters to changes made by the selected user, identified by their external username. This is stable over time and works even for users who have no owner association.'
      )}
      links={[{ label: t('Learn more'), href: ACTIVITY_DOCS }]}
    />
  );
};
