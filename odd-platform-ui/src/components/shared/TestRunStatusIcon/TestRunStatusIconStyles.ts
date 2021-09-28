import { styled } from '@mui/material/styles';
import { DataQualityTestRunStatusEnum } from 'generated-sources';

export const Content = styled('div')<{
  typeName: DataQualityTestRunStatusEnum;
}>(({ theme, typeName }) => ({
  padding: theme.spacing(0.5),
  marginRight: theme.spacing(1),
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: theme.palette.runStatus[typeName],
}));
