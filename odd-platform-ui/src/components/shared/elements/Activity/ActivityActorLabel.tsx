import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { UserIcon } from 'components/shared/icons';
import type { Activity } from 'redux/interfaces';

interface ActivityActorLabelProps {
  // The Activity's actor — the redux-serialized AssociatedOwner (identity.username + current owner).
  createdBy?: Activity['createdBy'];
}

// Renders an action's actor with BOTH identities: the immutable external username and, when the user
// has an owner association, the current owner name ("alice as Owner Team A"). Re-associating an owner
// changes only the owner part; the username is stable. Shared by the global + per-entity Activity items
// so the two surfaces stay consistent (#1657 / CTRIB-010).
const ActivityActorLabel: React.FC<ActivityActorLabelProps> = ({ createdBy }) => {
  const { t } = useTranslation();
  const username = createdBy?.identity?.username;
  const ownerName = createdBy?.owner?.name;
  const showOwner = !!username && !!ownerName && ownerName !== username;

  return (
    <Grid display='flex' flexWrap='nowrap' alignItems='center'>
      <UserIcon stroke='black' />
      <Typography variant='body1' sx={{ ml: 0.5 }}>
        {username || ownerName}
        {showOwner && (
          <Typography component='span' variant='subtitle1' sx={{ ml: 0.5, color: 'text.secondary' }}>
            {t('as Owner')} {ownerName}
          </Typography>
        )}
      </Typography>
    </Grid>
  );
};

export default ActivityActorLabel;
