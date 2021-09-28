import createTypography, {
  TypographyOptions,
} from '@material-ui/core/styles/createTypography';
import { palette } from 'theme/palette';
import { breakpoints } from 'theme/breakpoints';

export const { pxToRem } = createTypography(palette, {});

export const breakpointDownMdBody1: TypographyOptions = {
  [breakpoints.down('md')]: {
    fontSize: pxToRem(14),
    lineHeight: pxToRem(20),
  },
};

export const breakpointDownMdBody2: TypographyOptions = {
  [breakpoints.down('md')]: {
    fontSize: pxToRem(12),
    lineHeight: pxToRem(16),
  },
};

export const typography = createTypography(palette, {
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
    ...breakpointDownMdBody1,
  },
  h4: {
    fontSize: pxToRem(14),
    lineHeight: pxToRem(20),
    fontWeight: 500,
    ...breakpointDownMdBody2,
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
    color: palette.text.secondary,
    fontWeight: 400,
    ...breakpointDownMdBody2,
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
    ...breakpointDownMdBody2,
  },
  body2: {
    fontSize: pxToRem(12),
    lineHeight: pxToRem(16),
    fontWeight: 400,
    color: palette.text.primary,
    ...breakpointDownMdBody2,
  },
  caption: {
    fontSize: pxToRem(12),
    lineHeight: pxToRem(16),
    fontWeight: 400,
    color: palette.text.hint,
  },
});
