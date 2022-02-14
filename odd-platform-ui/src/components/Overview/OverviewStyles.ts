import { Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import {
  maxContentWidthWithoutSidebar,
  maxTagsContainerWidth,
} from 'lib/constants';
import { styled } from '@mui/material/styles';

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

export const InfoBarItemAlerts = styled(InfoBarItem)(() => ({
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
}));
