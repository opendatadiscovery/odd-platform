import styled from 'styled-components';
import { Typography } from '@mui/material';

export const IconContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: theme.spacing(1),
  width: '100%',
  height: '72px',
  backgroundColor: theme.palette.attachment.normal.background,
  color: '#528EFF',
}));

export const NameContainer = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  textAlign: 'center',
  width: '60%',
  overflow: 'hidden',
  display: '-webkit-box',
  '-webkit-line-clamp': '3',
  '-webkit-box-orient': 'vertical',
  color: theme.palette.attachment.normal.color,
}));

export const ActionsContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'nowrap',
  columnGap: theme.spacing(0.5),
  padding: theme.spacing(0.25),
  borderRadius: theme.spacing(0.5),
  backgroundColor: theme.palette.backgrounds.default,
  position: 'absolute',
  top: '4px',
  right: '4px',
  opacity: 0.6,
  visibility: 'hidden',
  zIndex: 2,
}));

export const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '96px',
  position: 'relative',

  '&:hover': {
    cursor: 'pointer',
    [`${NameContainer}`]: { color: theme.palette.attachment.hover.color },
    [`${IconContainer}`]: { backgroundColor: theme.palette.attachment.hover.background },
    [`${ActionsContainer}`]: { visibility: 'visible' },
  },

  '&:active': {
    [`${NameContainer}`]: { color: theme.palette.attachment.active.color },
    [`${IconContainer}`]: { backgroundColor: theme.palette.attachment.active.background },
  },
}));
