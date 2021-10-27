import { Theme } from '@mui/material/styles';
import { createStyles, WithStyles } from '@mui/styles';

export const styles = (theme: Theme) => createStyles({});

export type StylesType = WithStyles<typeof styles>;
