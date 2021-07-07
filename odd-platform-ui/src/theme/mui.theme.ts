import {
  createMuiTheme,
  responsiveFontSizes,
} from '@material-ui/core/styles';
import { Shadows } from '@material-ui/core/styles/shadows';

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

const shadows: Shadows = new Array(25).fill('none') as Shadows;
shadows[1] = '0 2px 6px 0 rgba(70, 73, 77, 0.2)';
shadows[2] = '0 -2px 2px 0 rgba(0, 0, 0, 0.1)';
shadows[3] = '0 1px 6px 0 rgba(70, 73, 77, 0.1)';
shadows[8] = '0px 2px 6px rgb(0 0 0 / 10%)';
shadows[9] = '0px 3px 12px rgba(0, 0, 0, 0.12)';

const theme = createMuiTheme({
  palette: {
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
  },
  typography: {
    fontSize: 14,
    h1: {
      fontSize: '1.25rem', // 20px
      lineHeight: 1.6, // 32px
      fontWeight: 500,
    },
    h2: {
      fontSize: '1.125rem', // 18px
      lineHeight: 1.35, // 24px
      fontWeight: 500,
    },
    h3: {
      fontSize: '1rem', // 16px
      lineHeight: 1.5, // 24px
      fontWeight: 500,
    },
    h4: {
      fontSize: '0.875rem', // 14px
      lineHeight: 1.45, // 20px
      fontWeight: 500,
    },
    h5: {
      fontSize: '0.75rem', // 12px
      lineHeight: 1.35, // 16px
      fontWeight: 500,
    },
    h6: {
      fontSize: '0.688rem', // 11px
      lineHeight: 1.5, // 16px
      fontWeight: 500,
    },
    subtitle1: {
      fontSize: '0.875rem', // 14px
      lineHeight: 1.45, // 20px
      color: '#7A869A',
      fontWeight: 400,
    },
    subtitle2: {
      fontSize: '0.75rem', // 12px
      lineHeight: 1.35, // 16px
      color: '#7A869A',
      fontWeight: 400,
    },
    body1: {
      fontSize: '0.875rem', // 14px
      lineHeight: 1.45, // 20px
      fontWeight: 400,
      color: '#091E42',
    },
    body2: {
      fontSize: '0.75rem', // 12px
      lineHeight: 1.35, // 16px
      fontWeight: 400,
      color: '#091E42',
    },
    caption: {
      fontSize: '0.75rem', // 12px
      lineHeight: 1.35, // 16px
      fontWeight: 400,
      color: '#B3BAC5',
    },
  },
  shadows,
  overrides: {
    MuiInput: {
      root: {
        border: '1px solid',
        borderColor: '#C1C7D0',
        borderRadius: '4px',
        backgroundColor: '#fff',
        '&:hover': {
          borderColor: '#7A869A',
        },
        '&.Mui-focused': {
          borderColor: '#0080FF',
        },
        '&.Mui-error': {
          borderColor: '#F2330D',
        },
        '&.Mui-disabled': {
          borderColor: '#EBECF0',
        },
      },
      input: {
        height: '16px',
        padding: '8px 0',
        width: '100%',
      },
    },
    MuiInputLabel: {
      root: {
        color: '#7A869A',
        fontWeight: 500,
        fontSize: '12px',
        backgroundColor: 'transparent',
        padding: 0,
        paddingBottom: '4px',
        '&.Mui-focused': {
          color: '#7A869A',
        },
        '&.MuiInputLabel-outlined.MuiInputLabel-shrink': {
          transform: 'none',
        },
      },
      formControl: {
        position: 'relative',
      },
      shrink: {
        transform: 'none',
      },
      outlined: {
        transform: 'none',
      },
      animated: {
        transition: 'none',
      },
    },
    MuiFormLabel: {
      asterisk: {
        color: '#F2330D',
      },
    },
    MuiOutlinedInput: {
      root: {
        border: '1px solid',
        borderColor: '#C1C7D0',
        borderRadius: '4px',
        backgroundColor: '#fff',
        '&:hover': {
          borderColor: '#7A869A',
        },
        '&.Mui-focused': {
          borderColor: '#0080FF',
        },
        '&.Mui-disabled': {
          borderColor: '#EBECF0',
        },
        fontSize: 'inherit',
        '&.MuiInputBase-root.MuiAutocomplete-inputRoot': {
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          '& .MuiAutocomplete-endAdornment': {
            top: 'calc(50% - 12px)',
          },
          '& .MuiAutocomplete-input': {
            fontSize: '14px',
            lineHeight: '20px',
            padding: '6px 14px 6px 8px',
          },
        },
      },
      input: {
        height: '20px',
        padding: '6px 14px 6px 8px',
        width: '100%',
        '&.MuiInputBase-inputMarginDense': {
          padding: '4px 14px 4px 8px',
          height: '16px',
          lineHeight: '16px',
        },
      },
      marginDense: {
        padding: 0,
      },
      notchedOutline: {
        border: 'none',
      },
      adornedEnd: {
        paddingRight: 0,
      },
      inputMarginDense: {
        paddingTop: '4.5px',
        paddingBottom: '4.5px',
      },
      multiline: {
        padding: '4px 8px',
      },
    },
    MuiInputBase: {
      input: {
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: '20px',
      },
      root: {
        '&.Mui-disabled': {
          border: 'none',
        },
      },
    },
    MuiInputAdornment: {
      positionEnd: {
        marginLeft: 0,
      },
    },
    MuiDialog: {
      paperWidthXs: { maxWidth: '368px' },
    },
    MuiDialogTitle: {
      root: {
        padding: '24px 24px 0 24px',
      },
    },
    MuiDialogContent: {
      root: {
        padding: '14px 24px 28px 24px',
      },
    },
    MuiDialogActions: {
      root: {
        padding: '0px 24px 24px 24px',
      },
    },
    MuiButton: {
      root: {
        borderRadius: '16px',
        color: '#0066CC',
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: '20px',
        letterSpacing: '0em',
        textAlign: 'center',
        textTransform: 'none',
      },
      text: { padding: '2px 8px' },
      startIcon: { marginRight: '4px' },
      endIcon: { marginLeft: '4px' },
      sizeLarge: {
        height: '32px',
        padding: '6px 8px',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: 500,
        lineHeight: '20px',
      },
      sizeSmall: {
        minWidth: 'auto',
        height: '20px',
        borderRadius: '4px',
        padding: '0 2px',
        fontSize: '0.875rem',
        fontWeight: 400,
      },
    },
    MuiSvgIcon: {
      root: {
        width: '16px',
        height: '16px',
      },
    },
    MuiIconButton: {
      root: {
        width: '24px',
        height: '24px',
        padding: '7px',
        '&:hover': {
          backgroundColor: 'none',
        },
      },
      sizeSmall: {
        color: '#0066CC',
        width: '16px',
        height: '16px',
        padding: '3px',
        borderRadius: '4px',
      },
    },
    MuiCheckbox: {
      root: {
        color: '#B3BAC5',
      },
      colorSecondary: {
        '&:hover': {
          backgroundColor: 'unset',
        },
        '&$checked:hover': {
          backgroundColor: 'unset !important',
        },
        '&$checked': {
          color: '#0080FF',
        },
      },
    },
    MuiRadio: {
      root: {
        color: '#B3BAC5',
      },
      colorSecondary: {
        '&:hover': {
          backgroundColor: 'unset',
        },
        '&$checked:hover': {
          backgroundColor: 'unset !important',
        },
        '&$checked': {
          color: '#0080FF',
        },
      },
    },
    MuiTooltip: {
      tooltip: {
        fontSize: '.9rem',
      },
    },
    MuiTabs: {
      flexContainer: {
        alignItems: 'center',
      },
      scrollButtons: {
        width: '20px',
        '&.Mui-disabled': {
          opacity: 0.2,
        },
      },
    },
    MuiTab: {
      root: {
        minHeight: '32px',
      },
    },
    MuiLink: {
      root: {
        textUnderlineOffset: '3px',
      },
    },
    MuiSelect: {
      root: {
        fontSize: '14px',
        lineHeight: '20px',
        '&.MuiSelect-outlined.MuiSelect-outlined': {
          paddingRight: '39px',
        },
      },
      icon: { top: 'calc(50% - 8px)' },
      outlined: {
        padding: '6px 28px 6px 6px',
        minWidth: '136px',
        width: '100%',
      },
      iconOutlined: { right: '9px' },
    },
    MuiMenuItem: {
      root: { fontSize: '14px', lineHeight: '20px' },
    },
    MuiPaper: {
      root: {
        border: ' 1px solid #EBECF0',
        borderRadius: '4px',
      },
      elevation9: {
        borderRadius: '8px',
      },
    },
    MuiMenu: {
      paper: { padding: '12px 8px' },
    },
    MuiList: {
      padding: { paddingTop: 0, paddingBottom: 0 },
      root: {
        '& > option': {
          cursor: 'pointer',
          height: '24px',
          padding: '4px 8px',
          '&:hover': {
            backgroundColor: '#F4F5F7',
          },
          '&:active': {
            backgroundColor: '#EBECF0',
          },
        },
      },
    },
    MuiCssBaseline: {
      '@global': {
        a: {
          font: 'inherit',
          color: 'inherit',
          textDecoration: 'inherit',
        },
      },
    },
  },
});

const themeResponsive = responsiveFontSizes(theme, {
  [theme.breakpoints.up(1200)]: { fontSize: '12px' },
});
export default themeResponsive;
