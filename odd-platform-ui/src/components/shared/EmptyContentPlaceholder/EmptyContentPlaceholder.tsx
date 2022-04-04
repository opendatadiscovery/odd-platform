import React from 'react';
import { Typography } from '@mui/material';
import EmptyIcon from 'components/shared/Icons/EmptyIcon';

export interface EmptyContentPlaceholderProps {
  text?: string;
}

const EmptyContentPlaceholder: React.FC<EmptyContentPlaceholderProps> = ({
  text = 'No content',
}) => (
  <Typography
    variant="subtitle2"
    sx={{
      mt: 2,
      display: 'flex',
      alignItems: 'center',
      alignSelf: 'flex-start',
    }}
    aria-label="EmptyContentPlaceholder"
  >
    <EmptyIcon sx={{ mr: 0.5 }} />
    {text}
  </Typography>
);

export default EmptyContentPlaceholder;
