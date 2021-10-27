import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) => createStyles({ container: {} });

export type StylesType = WithStyles<typeof styles>;
