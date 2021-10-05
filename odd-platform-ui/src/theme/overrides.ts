import { pxToRem, breakpointDownLgBody2 } from 'theme/typography';
import { Components } from '@mui/material';

export const components: Components = {
  MuiInput: {
    styleOverrides: {
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
  },
  MuiInputLabel: {
    styleOverrides: {
      root: {
        color: '#7A869A',
        fontWeight: 500,
        fontSize: '12px',
        backgroundColor: 'transparent',
        padding: 0,
        paddingBottom: '4px',
        position: 'relative',
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
  },
  MuiFormLabel: {
    styleOverrides: {
      asterisk: {
        color: '#F2330D',
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
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
          paddingRight: 8,
          '& .MuiAutocomplete-endAdornment': {
            top: 'calc(50% - 12px)',
          },
          '& .MuiAutocomplete-input': {
            padding: '6px 14px 6px 8px',
            fontSize: pxToRem(14),
            lineHeight: pxToRem(20),
            ...breakpointDownLgBody2,
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
      notchedOutline: {
        border: 'none',
      },
      adornedEnd: {
        paddingRight: 0,
      },
      multiline: {
        padding: '4px 8px',
      },
    },
  },
  MuiInputBase: {
    styleOverrides: {
      input: {
        fontWeight: 400,
        fontSize: pxToRem(14),
        lineHeight: pxToRem(20),
        ...breakpointDownLgBody2,
      },
      root: {
        '&.Mui-disabled': {
          border: 'none',
        },
      },
    },
  },
  MuiInputAdornment: {
    styleOverrides: {
      positionEnd: {
        marginLeft: 0,
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paperWidthXs: { maxWidth: '368px' },
    },
  },
  MuiDialogTitle: {
    styleOverrides: {
      root: {
        padding: '24px 24px 0 24px',
      },
    },
  },
  MuiDialogContent: {
    styleOverrides: {
      root: {
        padding: '14px 24px 28px 24px',
      },
    },
  },
  MuiDialogActions: {
    styleOverrides: {
      root: {
        padding: '0px 24px 24px 24px',
      },
    },
  },
  MuiCheckbox: {
    styleOverrides: {
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
  },
  MuiRadio: {
    styleOverrides: {
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
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        fontSize: '.9rem',
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      flexContainer: { alignItems: 'center' },
      scrollButtons: {
        width: '20px',
        '&.Mui-disabled': {
          opacity: 0.2,
        },
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        minHeight: '32px',
      },
    },
  },
  MuiLink: {
    styleOverrides: {
      root: {
        textUnderlineOffset: '3px',
      },
    },
  },
  MuiSelect: {
    styleOverrides: {
      root: {
        fontSize: pxToRem(14),
        lineHeight: pxToRem(20),
        ...breakpointDownLgBody2,
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
  },
  MuiMenuItem: {
    styleOverrides: {
      root: { fontSize: '14px', lineHeight: '20px' },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        border: ' 1px solid #EBECF0',
        borderRadius: '4px',
      },
      elevation9: {
        borderRadius: '8px',
      },
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: { padding: '12px 8px' },
    },
  },
  MuiList: {
    styleOverrides: {
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
  },
  MuiCssBaseline: {
    styleOverrides: {
      'a:-webkit-any-link': {
        font: 'inherit',
        color: 'inherit',
        textDecoration: 'inherit',
      },
    },
  },
};
