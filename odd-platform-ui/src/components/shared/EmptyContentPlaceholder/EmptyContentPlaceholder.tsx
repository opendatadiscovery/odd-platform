import React from 'react';
import { Typography } from '@mui/material';
import EmptyIcon from 'components/shared/Icons/EmptyIcon';

interface EmptyContentPlaceholderProps {
  text?: string;
  isContentLoaded?: boolean;
  isContentEmpty?: boolean;
}

const EmptyContentPlaceholder: React.FC<EmptyContentPlaceholderProps> = ({
  text = 'No content',
  isContentLoaded = true,
  isContentEmpty = true,
}) =>
  isContentLoaded && isContentEmpty ? (
    <Typography
      variant='subtitle2'
      sx={{ display: 'flex', alignItems: 'center', alignSelf: 'flex-start' }}
    >
      <EmptyIcon sx={{ mr: 0.5 }} />
      {text}
    </Typography>
  ) : null;

export default EmptyContentPlaceholder;
