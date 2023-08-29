import styled from 'styled-components';
import { Typography } from '@mui/material';
import type { MessageState } from 'generated-sources';

export const Container = styled(Typography)<{ $status: MessageState }>(
  ({ $status, theme }) => ({
    borderRadius: '12px',
    padding: theme.spacing(0.25, 1),
    backgroundColor: theme.palette.discussionsMessageStatus[$status].background,
    color: theme.palette.discussionsMessageStatus[$status].color,
  })
);
