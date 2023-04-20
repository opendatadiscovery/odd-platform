import { Grid, Typography } from '@mui/material';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const ListLinksContainer = styled('ul')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: 0,
  listStyle: 'none',
  height: '100%',
  justifyContent: 'center',
  '& li': { marginBottom: theme.spacing(1) },
}));

export const ListLink = styled(Link)<{ $hasAlerts?: boolean }>(
  ({ theme, $hasAlerts }) => ({
    padding: theme.spacing(0.25),
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    textDecoration: 'none',
    color: theme.palette.texts?.primary,
    borderRadius: '4px',
    '&:active': {
      backgroundColor: theme.palette.backgrounds.secondary,
    },
    ...($hasAlerts
      ? {
          backgroundColor: theme.palette.alert.OPEN.background,
          '&:hover': {
            backgroundColor: theme.palette.alert.OPEN.border,
          },
        }
      : {
          '&:hover': {
            backgroundColor: theme.palette.backgrounds.primary,
          },
        }),
  })
);

export const ListLinkInnerItem = styled('div')<{ $bounded?: boolean }>(
  ({ $bounded }) => ({
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    overflow: $bounded ? 'hidden' : undefined,
  })
);

export const SectionCaption = styled(Typography)(({ theme }) => ({
  color: theme.palette.texts?.primary,
  display: 'flex',
  alignItems: 'center',
  '& > svg ': {
    marginRight: theme.spacing(0.5),
    height: theme.spacing(2),
    width: theme.spacing(2),
  },
}));

export const DataEntityListContainer = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(1.5),
  border: `1px solid ${theme.palette.backgrounds.secondary}`,
  borderRadius: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
}));
