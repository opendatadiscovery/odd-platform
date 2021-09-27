import { palette } from 'theme/palette';
import { breakpoints } from 'theme/breakpoints';
import createTypography, {
  TypographyOptions,
} from '@mui/material/styles/createTypography';
import { Palette } from '@mui/material';
import { createTheme } from '@mui/material/styles';

export const { pxToRem } = createTypography(palette as Palette, {});

export const breakpointDownLgBody1: TypographyOptions = {
  [createTheme({ breakpoints }).breakpoints.down('lg')]: {
    fontSize: pxToRem(14),
    lineHeight: pxToRem(20),
  },
};

export const breakpointDownLgBody2: TypographyOptions = {
  [createTheme({ breakpoints }).breakpoints.down('lg')]: {
    fontSize: pxToRem(12),
    lineHeight: pxToRem(16),
  },
};

export const typography = createTypography(palette as Palette, {
  h1: {
    fontSize: pxToRem(20),
    lineHeight: pxToRem(32),
    fontWeight: 500,
  },
  h2: {
    fontSize: pxToRem(18),
    lineHeight: pxToRem(24),
    fontWeight: 500,
  },
  h3: {
    fontSize: pxToRem(16),
    lineHeight: pxToRem(24),
    fontWeight: 500,
    ...breakpointDownLgBody1,
  },
  h4: {
    fontSize: pxToRem(14),
    lineHeight: pxToRem(20),
    fontWeight: 500,
    ...breakpointDownLgBody2,
  },
  h5: {
    fontSize: pxToRem(12),
    lineHeight: pxToRem(16),
    fontWeight: 500,
  },
  h6: {
    fontSize: pxToRem(11),
    lineHeight: pxToRem(16),
    fontWeight: 500,
  },
  subtitle1: {
    fontSize: pxToRem(14),
    lineHeight: pxToRem(20),
    color: palette.text?.secondary,
    fontWeight: 400,
    ...breakpointDownLgBody2,
  },
  subtitle2: {
    fontSize: pxToRem(12),
    lineHeight: pxToRem(16),
    color: palette.text.secondary,
    fontWeight: 400,
  },
  body1: {
    fontSize: pxToRem(14),
    lineHeight: pxToRem(20),
    fontWeight: 400,
    color: palette.text.primary,
    ...breakpointDownLgBody2,
  },
  body2: {
    fontSize: pxToRem(12),
    lineHeight: pxToRem(16),
    fontWeight: 400,
    color: palette.text.primary,
    ...breakpointDownLgBody2,
  },
  caption: {
    fontSize: pxToRem(12),
    lineHeight: pxToRem(16),
    fontWeight: 400,
    color: palette.texts.hint,
  },
});
