import createPalette from '@material-ui/core/styles/createPalette';

const colors = {
  primary: '#3a5ad1',
  primaryLight: '#758be1',
  secondary: '#dd357e',
  warning: '#f38435',
  warningLight: '#FF0000',
  secondaryLight: '#f9f9fa',
  textInfo: '#d8d8df',
  textPrimary: '#091E42',
  textHint: '#A8B0BD',
  textSecondary: '#7A869A',
  divider: '#b6bac4',
  background: '#f4f4f6',
  success: '#4baa73',
  successLight: '#27AE60',
};

export const palette = createPalette({
  primary: {
    main: colors.primary,
    light: colors.primaryLight,
  },
  secondary: {
    main: colors.secondary,
    light: colors.secondaryLight,
  },
  warning: {
    main: colors.warning,
    light: colors.warningLight,
  },
  text: {
    primary: colors.textPrimary,
    secondary: colors.textSecondary,
    hint: colors.textHint,
    disabled: colors.textHint,
  },
  background: { default: '#ffffff' },
  divider: colors.divider,
  success: { main: colors.success },
});
