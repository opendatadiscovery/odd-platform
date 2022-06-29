import styled from 'styled-components';

type KeyType = 'Primary' | 'Sort';
interface FilledContainerProps {
  $typeName: KeyType;
}
const typeChecker = (type: KeyType) => type;
export const Container = styled('div')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  marginTop: theme.spacing(0.3),
}));
export const FilledContainer = styled('span')<FilledContainerProps>(
  ({ theme, $typeName }) => ({
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
    borderRadius: '12px',
    border: '1px solid',
    padding: theme.spacing(0, 1),
    backgroundColor: theme.palette.key[typeChecker($typeName)].background,
    borderColor: theme.palette.key[typeChecker($typeName)].border,
    marginLeft: '10px',
  })
);
