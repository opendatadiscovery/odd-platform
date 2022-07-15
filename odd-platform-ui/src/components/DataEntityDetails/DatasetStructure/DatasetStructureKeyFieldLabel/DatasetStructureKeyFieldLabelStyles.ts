import styled from 'styled-components';

export type DatasetFieldKeyType = 'primary' | 'sort';

interface FilledContainerProps {
  $keyType: DatasetFieldKeyType;
}

export const Container = styled('div')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  marginTop: theme.spacing(0.3),
  whiteSpace: 'nowrap',
}));
export const FilledContainer = styled('span')<FilledContainerProps>(
  ({ theme, $keyType }) => ({
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
    borderRadius: '12px',
    padding: theme.spacing(0, 1),
    backgroundColor: theme.palette.datasetFieldKey[$keyType].background,
    marginLeft: '10px',
    color: theme.palette.common.white,
  })
);
