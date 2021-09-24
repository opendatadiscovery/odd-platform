import createPalette from '@material-ui/core/styles/createPalette';

const colors = {
  black: '#000000',
  white: '#FFFFFF',
  transparent: 'transparent',

  black90: '#091E42',
  black80: '#253858',
  black70: '#42526E',
  black60: '#5E6C84',
  black50: '#7A869A',
  black40: '#97A0AF',
  black30: '#A8B0BD',
  black20: '#C1C7D0',
  black15: '#DFE1E6',
  black10: '#EBECF0',
  black5: '#F4F5F7',

  blue65: '#0059B2',
  blue60: '#0066CC',
  blue50: '#0080FF',
  blue40: '#3399FF',
  blue30: '#66B3FF',
  blue20: '#99CCFF',
  blue10: '#CCE6FF',
  blue5: '#E5F2FF',

  orange50: '#FFAA00',
  orange40: '#FFBB33',
  orange20: '#FFDD99',
  orange10: '#FFEECC',
  orange5: '#FFF6E5',

  green60: '#1FAD1F',
  green40: '#14B84B',
  green20: '#A8F0A8',
  green10: '#D1FADF',
  green5: '#E8FCEF',

  lightGreen60: '#A7FF33',
  lightGreen40: '#D3FF99',

  turquoise40: '#33FF99',
  turquoise20: '#99FFCC',

  red60: '#C2290A',
  red50: '#F2330D',
  red40: '#F55C3D',
  red20: '#FF9999',
  red10: '#FFCCCC',
  red5: '#FFE5E6',

  pink60: '#EE99FF',

  purple40: '#5533FF',
  purple30: '#8066FF',
  purple20: '#AA99FF',
  purple10: '#D4CCFF',
  purple5: '#EAE5FF',
};

export const palette = createPalette({
  common: { black: colors.black, white: colors.white },
  texts: {
    primary: colors.black90,
    secondary: colors.black50,
    hint: colors.black30,
    info: colors.black70,
  },
  warning: {
    main: colors.red50,
    light: colors.orange10,
  },
  backgrounds: {
    primary: colors.black5,
    secondary: colors.black10,
    darken: colors.black90,
    default: colors.white,
  },
  info: {
    main: colors.black90,
    light: colors.black20,
    dark: colors.black80,
  },
  divider: colors.black10,
  entityType: {
    SET: colors.red5,
    TRANSFORMER: colors.purple5,
    CONSUMER: colors.blue5,
    INPUT: colors.green5,
    QUALITY_TEST: colors.orange5,
  },
  runStatus: {
    success: colors.green60,
    failed: colors.red50,
    broken: colors.orange50,
    skipped: colors.blue50,
    aborted: colors.purple30,
    unknown: colors.black30,
  },
  reportStatus: {
    success: { background: colors.green10, border: colors.green20 },
    failed: { background: colors.red10, border: colors.red20 },
    broken: { background: colors.orange10, border: colors.orange20 },
    skipped: { background: colors.blue10, border: colors.blue20 },
    aborted: { background: colors.purple10, border: colors.purple30 },
    unknown: { background: colors.black10, border: colors.black20 },
  },
  button: {
    primary: {
      normal: {
        background: colors.blue50,
        color: colors.white,
        border: colors.blue50,
      },
      hover: { background: colors.blue60, color: colors.white },
      active: { background: colors.blue65, color: colors.white },
      disabled: { background: colors.blue20, color: colors.white },
    },
    primaryLight: {
      normal: { background: colors.blue5, color: colors.blue60 },
      hover: {
        background: colors.blue10,
        color: colors.blue60,
        border: colors.blue10,
      },
      active: { background: colors.blue20, color: colors.blue60 },
      disabled: { background: colors.blue5, color: colors.blue20 },
    },
    secondary: {
      normal: { background: colors.white, color: colors.blue60 },
      hover: { background: colors.blue50, color: colors.white },
      active: { background: colors.blue60, color: colors.white },
      disabled: { background: colors.white, color: colors.blue20 },
    },
    tertiary: {
      normal: { background: colors.white, color: colors.blue60 },
      hover: { background: colors.blue5, color: colors.blue60 },
      active: { background: colors.blue10, color: colors.blue65 },
    },
    dropdown: {
      normal: { background: colors.transparent, color: colors.blue50 },
      hover: { background: colors.transparent, color: colors.blue60 },
      active: { background: colors.transparent, color: colors.blue65 },
    },
    expand: {
      normal: { background: colors.blue5, color: colors.blue60 },
      hover: { background: colors.blue10, color: colors.blue60 },
      active: { background: colors.blue50, color: colors.white },
    },
    unfilled: {
      normal: { background: colors.transparent, color: colors.black30 },
      hover: { background: colors.transparent, color: colors.black70 },
      active: { background: colors.transparent, color: colors.black90 },
    },
  },
  tag: {
    main: {
      normal: { border: colors.black10, color: colors.black70 },
      hover: { border: colors.black20, color: colors.black70 },
      active: { border: colors.black30, color: colors.black70 },
    },
    important: {
      normal: {
        border: colors.orange40,
        color: colors.black70,
        background: colors.orange40,
      },
      hover: {
        border: colors.orange50,
        color: colors.black70,
        background: colors.orange50,
      },
      active: { border: colors.orange50, color: colors.black70 },
    },
  },
  structureLabel: {
    STRING: { border: colors.orange20 },
    BOOLEAN: { border: colors.purple20 },
    INTEGER: { border: colors.green20 },
    NUMBER: { border: colors.pink60 },
    BINARY: { border: colors.red20 },
    DATETIME: { border: colors.blue20 },
    STRUCT: { border: colors.black20 },
    LIST: { border: colors.lightGreen60 },
    MAP: { border: colors.turquoise40 },
  },
  alert: {
    open: { background: colors.red10, border: colors.red20 },
    resolved: { background: colors.blue10, border: colors.blue20 },
  },
  background: { default: colors.white },
});
