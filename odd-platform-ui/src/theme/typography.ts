import { palette } from 'theme/palette';
import { breakpoints } from 'theme/breakpoints';
import createTypography from '@mui/material/styles/createTypography';
import { Palette } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { CSSObject } from 'styled-components';

export const { pxToRem } = createTypography(palette as Palette, {});

export const breakpointDownLgBody1: CSSObject = {
  [createTheme({ breakpoints }).breakpoints.down('lg')]: {
    fontSize: pxToRem(14),
    lineHeight: pxToRem(20),
  },
};

export const breakpointDownLgBody2: CSSObject = {
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
    color: palette.texts.secondary,
    fontWeight: 400,
    ...breakpointDownLgBody2,
  },
  subtitle2: {
    fontSize: pxToRem(12),
    lineHeight: pxToRem(16),
    color: palette.texts.secondary,
    fontWeight: 400,
  },
  body1: {
    fontSize: pxToRem(14),
    lineHeight: pxToRem(20),
    fontWeight: 400,
    color: palette.texts.primary,
    ...breakpointDownLgBody2,
  },
  body2: {
    fontSize: pxToRem(12),
    lineHeight: pxToRem(16),
    fontWeight: 400,
    color: palette.texts.primary,
    ...breakpointDownLgBody2,
  },
  caption: {
    fontSize: pxToRem(12),
    lineHeight: pxToRem(16),
    fontWeight: 400,
    color: palette.texts.hint,
  },
  errorCode: {
    fontSize: pxToRem(72),
    lineHeight: pxToRem(84),
    fontWeight: 500,
  },
  totalCountTitle: {
    fontSize: pxToRem(40),
    lineHeight: pxToRem(36),
    fontWeight: 500,
  },
});
