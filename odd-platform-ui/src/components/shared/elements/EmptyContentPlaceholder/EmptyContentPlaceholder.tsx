import React from 'react';
import { type Theme, Typography } from '@mui/material';
import EmptyIcon from 'components/shared/icons/EmptyIcon';
import { type SxProps } from '@mui/system';

interface EmptyContentPlaceholderProps {
  text?: string;
  isContentLoaded?: boolean;
  isContentEmpty?: boolean;
  sx?: SxProps<Theme>;
}

const EmptyContentPlaceholder: React.FC<EmptyContentPlaceholderProps> = ({
  text = 'No content',
  isContentLoaded = true,
  isContentEmpty = true,
  sx,
}) =>
  isContentLoaded && isContentEmpty ? (
    <Typography
      variant='subtitle2'
      sx={{
        display: 'flex',
        alignItems: 'center',
        alignSelf: 'flex-start',
        mt: 2,
        ...sx,
      }}
    >
      <EmptyIcon sx={{ mr: 0.5 }} />
      {text}
    </Typography>
  ) : null;

export default EmptyContentPlaceholder;
