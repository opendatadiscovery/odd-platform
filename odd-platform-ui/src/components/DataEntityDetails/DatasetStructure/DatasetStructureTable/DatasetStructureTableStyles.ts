import { Grid, Theme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { propsChecker } from 'lib/helpers';

export type ColType = 'name' | 'uniq' | 'missing' | 'stats';

export const columnBasicStyles = (theme: Theme) => ({
  name: {
    flexGrow: 1,
    width: '68%',
    maxWidth: 'calc(100% - 140px)',
  },
  uniq: {
    display: 'flex',
    flexGrow: 1,
  },
  missing: {
    display: 'flex',
    flexGrow: 1,
  },
  stats: {},
});

export const Container = styled(Grid)(() => ({
  position: 'relative',
}));

export const ColContainer = styled(Grid, {
  shouldForwardProp: propsChecker,
})<{
  $colType: ColType;
}>(({ theme, $colType }) => ({
  ...columnBasicStyles(theme)[$colType],
}));

export const TableHeader = styled(Grid)(({ theme }) => ({
  color: theme.palette.texts.hint,
  '& > *': {
    borderBottom: '1px solid',
    borderBottomColor: theme.palette.backgrounds.primary,
  },
}));
