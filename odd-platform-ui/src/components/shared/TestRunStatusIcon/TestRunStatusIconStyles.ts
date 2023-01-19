import styled from 'styled-components';
import { type DataEntityRunStatus } from 'generated-sources';

export const Content = styled('div')<{
  $typeName: DataEntityRunStatus;
}>(({ theme, $typeName }) => ({
  padding: theme.spacing(0.5),
  marginRight: theme.spacing(1),
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: theme.palette.runStatus[$typeName].color,
}));
