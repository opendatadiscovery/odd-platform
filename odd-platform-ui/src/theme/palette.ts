import createPalette from '@mui/material/styles/createPalette';

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
  lightGreen5: '#F4FFE5',

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
    action: colors.blue60,
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
  entityClass: {
    DATA_SET: colors.red5,
    DATA_TRANSFORMER: colors.purple5,
    DATA_CONSUMER: colors.blue5,
    DATA_INPUT: colors.green5,
    DATA_QUALITY_TEST: colors.orange5,
    DATA_TRANSFORMER_RUN: colors.purple5,
    DATA_QUALITY_TEST_RUN: colors.orange5,
    DATA_ENTITY_GROUP: colors.lightGreen5,
  },
  runStatus: {
    SUCCESS: colors.green60,
    FAILED: colors.red50,
    BROKEN: colors.orange50,
    SKIPPED: colors.blue50,
    ABORTED: colors.purple30,
    UNKNOWN: colors.black30,
  },
  reportStatus: {
    SUCCESS: { background: colors.green10, border: colors.green20 },
    FAILED: { background: colors.red10, border: colors.red20 },
    BROKEN: { background: colors.orange10, border: colors.orange20 },
    SKIPPED: { background: colors.blue10, border: colors.blue20 },
    ABORTED: { background: colors.purple10, border: colors.purple30 },
    UNKNOWN: { background: colors.black10, border: colors.black20 },
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
    expandText: {
      normal: { background: colors.blue5, color: colors.blue60 },
      hover: { background: colors.blue10, color: colors.blue60 },
      active: { background: colors.blue20, color: colors.blue60 },
    },
    unfilled: {
      normal: { background: colors.transparent, color: colors.black30 },
      hover: { background: colors.transparent, color: colors.black70 },
      active: { background: colors.transparent, color: colors.black90 },
    },
    collapse: {
      normal: {
        background: colors.black20,
        color: colors.white,
        border: colors.black90,
      },
      hover: {
        background: colors.black20,
        color: colors.white,
        border: colors.black90,
      },
      active: {
        background: colors.black20,
        color: colors.white,
        border: colors.black90,
      },
    },
    valueCount: {
      normal: { background: colors.black10, color: colors.black50 },
      hover: { background: colors.black15, color: colors.black70 },
      active: { background: colors.black15, color: colors.black90 },
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
    TYPE_STRING: { border: colors.orange20 },
    TYPE_BOOLEAN: { border: colors.purple20 },
    TYPE_INTEGER: { border: colors.green20 },
    TYPE_NUMBER: { border: colors.pink60 },
    TYPE_BINARY: { border: colors.red20 },
    TYPE_DATETIME: { border: colors.blue20 },
    TYPE_STRUCT: { border: colors.black20 },
    TYPE_LIST: { border: colors.lightGreen60 },
    TYPE_MAP: { border: colors.turquoise40 },
    TYPE_CHAR: { border: colors.green40 },
    TYPE_TIME: { border: colors.purple5 },
    TYPE_UNION: { border: colors.blue65 },
    TYPE_DURATION: { border: colors.blue40 },
    TYPE_UNKNOWN: { border: colors.black10 },
  },
  datasetFieldKey: {
    primary: {
      background: colors.black30,
      color: colors.white,
      border: colors.blue30,
    },
    sort: {
      background: colors.black30,
      color: colors.white,
      border: colors.blue10,
    },
  },
  alert: {
    OPEN: {
      background: colors.red10,
      border: colors.red20,
      color: colors.red5,
    },
    RESOLVED: { background: colors.blue10, border: colors.blue20 },
  },
  textField: {
    normal: { border: colors.black20, background: colors.white },
    hover: { border: colors.black50, color: colors.blue60 },
    active: { border: colors.blue50 },
    error: { border: colors.red50 },
    disabled: { border: colors.black10 },
  },
  background: { default: colors.white },
});
