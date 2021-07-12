import { Overrides } from '@material-ui/core/styles/overrides';
import { breakpoints, pxToRem } from 'theme/typography';

export const overrides: Overrides = {
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
          padding: '6px 14px 6px 8px',
          fontSize: pxToRem(14),
          lineHeight: pxToRem(20),
          [breakpoints.down(1200)]: {
            fontSize: pxToRem(12),
            lineHeight: pxToRem(16),
          },
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
      fontWeight: 400,
      fontSize: pxToRem(14),
      lineHeight: pxToRem(20),
      [breakpoints.down(1200)]: {
        fontSize: pxToRem(12),
        lineHeight: pxToRem(16),
      },
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
      fontWeight: 400,
      letterSpacing: '0em',
      textAlign: 'center',
      textTransform: 'none',
      fontSize: pxToRem(14),
      lineHeight: pxToRem(20),
      [breakpoints.down(1200)]: {
        fontSize: pxToRem(12),
        lineHeight: pxToRem(16),
      },
    },
    text: { padding: '2px 8px' },
    startIcon: { marginRight: '4px' },
    endIcon: { marginLeft: '4px' },
    sizeLarge: {
      height: '32px',
      padding: '6px 8px',
      borderRadius: '4px',
      fontWeight: 500,
      fontSize: pxToRem(14),
      lineHeight: pxToRem(20),
      [breakpoints.down(1200)]: {
        fontSize: pxToRem(12),
        lineHeight: pxToRem(16),
      },
    },
    sizeSmall: {
      minWidth: 'auto',
      height: '20px',
      borderRadius: '4px',
      padding: '0 2px',
      fontWeight: 400,
      fontSize: pxToRem(14),
      lineHeight: pxToRem(20),
      [breakpoints.down(1200)]: {
        fontSize: pxToRem(12),
        lineHeight: pxToRem(16),
      },
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
      fontSize: pxToRem(14),
      lineHeight: pxToRem(20),
      [breakpoints.down(1200)]: {
        fontSize: pxToRem(12),
        lineHeight: pxToRem(16),
      },
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
};
