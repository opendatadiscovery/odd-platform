import styled from 'styled-components';

export const DataEntitiesUsageContainer = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

export const UsageInfoHeader = styled('div')(({ theme }) => ({
  padding: theme.spacing(2, 1.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const DataEntitiesTotalContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  '& > *': { marginRight: theme.spacing(0.75) },
}));

export const UnfilledEntities = styled('span')(({ theme }) => ({
  backgroundColor: theme.palette.reportStatus.BROKEN.background,
  border: `1px solid ${theme.palette.reportStatus.BROKEN.border}`,
  padding: theme.spacing(0.25, 1),
  borderRadius: theme.spacing(1.8),
  color: theme.palette.info.main,
  fontSize: theme.typography.body2.fontSize,
}));

export const ListItemContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'nowrap',
  width: '100%',
  '& > *': {
    borderRight: `1px solid ${theme.palette.divider}`,
    '&:last-child': { border: 'none' },
  },
}));
