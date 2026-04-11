import React from 'react';
import TruncateMarkup from 'react-truncate-markup';
import { type Owner } from 'generated-sources';
import { Typography } from '@mui/material';

interface OwnerRoleCellProps {
  roles: Owner['roles'];
}

export const OwnerRoleCell: React.FC<OwnerRoleCellProps> = ({ roles }) => (
  <TruncateMarkup lines={1} tokenize='words'>
    <div style={{ display: 'flex' }}>
      {roles?.map((role, idx) => (
        <TruncateMarkup.Atom key={role.id}>
          <Typography variant='body1'>{`${idx ? ', ' : ''} ${role.name}`}</Typography>
        </TruncateMarkup.Atom>
      ))}
    </div>
  </TruncateMarkup>
);
