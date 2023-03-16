import styled from 'styled-components';

export const DataEntitiesUsageContainer = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.backgrounds.secondary}`,
  boxShadow: theme.shadows[9],
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
}));

export const UnfilledEntities = styled('span')(({ theme }) => ({
  backgroundColor: theme.palette.reportStatus.BROKEN.background,
  border: `1px solid ${theme.palette.reportStatus.BROKEN.border}`,
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.spacing(1.8),
  color: theme.palette.info.main,
}));

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
