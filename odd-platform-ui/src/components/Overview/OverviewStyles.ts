import { Grid, GridProps } from '@mui/material';
import { Link } from 'react-router-dom';
import {
  maxContentWidthWithoutSidebar,
  maxTagsContainerWidth,
} from 'lib/constants';
import styled from 'styled-components';

export const Container = styled('div')(({ theme }) => ({
  margin: '0 auto',
  padding: theme.spacing(2),
  width: `${maxContentWidthWithoutSidebar}px`,
  [theme.breakpoints.up(maxContentWidthWithoutSidebar)]: {
    width: '100%',
    maxWidth: `${maxContentWidthWithoutSidebar}px`,
    justifyContent: 'center',
  },
}));

export const TagsContainer = styled(Grid)(() => ({
  maxWidth: `${maxTagsContainerWidth}px`,
  justifyContent: 'center',
  margin: '0 auto',
}));

export const InfoBarItem = styled(Grid)(({ theme }) => ({
  height: '56px',
  marginRight: theme.spacing(3),
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.backgrounds.primary,
  borderRadius: '4px',
}));

export const AllAlertsBtnContainer = styled(Link)(({ theme }) => ({
  visibility: 'hidden',
  fontSize: theme.typography.subtitle2.fontSize,
  lineHeight: theme.typography.subtitle2.lineHeight,
}));

export const InfoBarItemAlerts = styled(InfoBarItem)<GridProps>(() => ({
  '&:hover': {
    [`${AllAlertsBtnContainer}`]: { visibility: 'visible' },
  },
}));

export const AlertsContainer = styled(Grid)(() => ({
  width: '33%',
  alignItems: 'center',
}));

export const InfoBarStatsText = styled('span')(({ theme }) => ({
  color: theme.palette.texts.hint,
  lineHeight: theme.typography.h2.lineHeight,
}));

export const DataEntityContainer = styled(Grid)(({ theme }) => ({
  justifyContent: 'space-between',
  marginTop: theme.spacing(3.5),
  marginLeft: 'auto',
  marginRight: 'auto',
  flexWrap: 'nowrap',
  '& > *': { paddingRight: theme.spacing(3) },
  '& > :last-child': { paddingRight: theme.spacing(0) },
}));

export const DataEntitiesUsageContainer = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.backgrounds.secondary}`,
  boxShadow: theme.shadows[9],
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
}));

export const UfilledEntities = styled('span')(({ theme }) => ({
  backgroundColor: theme.palette.reportStatus.BROKEN.background,
  border: `1px solid ${theme.palette.reportStatus.BROKEN.border}`,
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.spacing(1.8),
  color: theme.palette.info.main,
}));
export const ListItem = styled('div')<{ $index?: number }>(
  ({ theme, $index }) => ({
    borderTop:
      $index !== 0 && $index !== 1
        ? `2px solid ${theme.palette.divider}`
        : 'none',
    width: '90%',
    paddingTop: theme.spacing(0.8),
    paddingBottom: theme.spacing(0.8),
    display: 'flex',
    alignItems: 'center',
    p: {
      color: theme.palette.texts.info,
      fontSize: theme.typography.subtitle1.fontSize,
      marginLeft: theme.spacing(0.5),
    },
    h4: { color: theme.palette.texts.primary },
  })
);

export const ListItemContainer = styled('div')(({ theme }) => ({
  width: '80%',
  borderLeft: `1px solid ${theme.palette.divider} `,
  padding: theme.spacing(4),
  display: 'flex',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
}));
export const DataEntitiesTotalContainer = styled('div')(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  h1: {
    color: theme.palette.texts.primary,
    fontSize: theme.typography.totalCountTitle.fontSize,
    lineHeight: theme.typography.totalCountTitle.lineHeight,
    marginBottom: theme.spacing(5),
    marginTop: theme.spacing(1.5),
  },
}));
