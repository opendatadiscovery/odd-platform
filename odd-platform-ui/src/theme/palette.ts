import createPalette from '@material-ui/core/styles/createPalette';
import { ODDPaletteOptions } from 'theme/interfaces';

const entityTypeColors = {
  SET: '#FFE5E6',
  TRANSFORMER: '#EAE5FF',
  CONSUMER: '#E5F2FF',
  INPUT: '#E8FCEF',
  QUALITY_TEST: '#FFF6E5',
};

const runStatusColors = {
  SUCCESS: '#1FAD1F',
  FAILED: '#F2330D',
  BROKEN: '#FFAA00',
  SKIPPED: '#0080FF',
  ABORTED: '#8066FF',
  UNKNOWN: '#A8B0BD',
};

const reportStatusColors = {
  success: { background: '#D1FADF', border: '#A8F0A8' },
  failed: { background: '#FFCCCC', border: '#FF9999' },
  broken: { background: '#FFEECC', border: '#FFDD99' },
  skipped: { background: '#CCE6FF', border: '#99CCFF' },
  aborted: { background: '#baacf7', border: '#8066FF' },
  unknown: { background: '#EBECF0', border: '#C1C7D0' },
};

const colors = {
  primary: '#3a5ad1',
  primaryLight: '#758be1',
  secondary: '#dd357e',
  warning: '#f38435',
  warningLight: '#FF0000',
  secondaryLight: '#f9f9fa',
  textInfo: '#d8d8df',
  textPrimary: '#091E42', // done
  textHint: '#A8B0BD',
  textSecondary: '#7A869A', // done
  textTertiary: '#42526E', // done
  textFourth: '#A8B0BD', // done
  textAction: '#0066CC', // done
  divider: '#EBECF0', // done
  background: '#F4F5F7', // done
  success: '#4baa73',
  successLight: '#27AE60',
  button: '#0080FF', // done
  black: '#000000', // done
  white: '#FFFFFF', // done
  red: '#FFFFFF', // done
  // 1: '#091E42', // 22
  2: '#253858', // 2
  // 3: '#42526E', // 20
  4: '#5E6C84', // 0
  // 5: '#7A869A', // 25
  6: '#97A0AF', // 0
  // 7: '#A8B0BD', // 17
  8: '#C1C7D0', // 8
  9: '#DFE1E6', // 0
  // 10: '#EBECF0', // 38
  // 11: '#F4F5F7', // 26
  // 12: '#FFFFFF', // 14

  13: '#0059B2', // 4
  // 14: '#0066CC', // 24
  // 15: '#0080FF', // 19
  16: '#99CCFF', // 9
  17: '#CCE6FF', // 6
  18: '#E5F2FF', // 6
  19: '#FFAA00', // 3
  20: '#FFBB33', // 2
  21: '#FFDD99', // 2
  22: '#FFEECC', // 2
  24: '#1FAD1F', // 1
  25: '#A8F0A8', // 2
  26: '#D1FADF', // 1
  28: '#A7FF33', // 1
  29: '#33FF99', // 1
  30: '#F2330D', // 5
  31: '#FF9999', // 3
  32: '#FFCCCC', // 2
  33: '#FFE5E6', // 2
  34: '#EE99FF', // 1
  35: '#8066FF', // 2
  36: '#AA99FF', // 1
};

export const palette = createPalette({
  common: { black: colors.black, white: colors.white },
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
  entityType: {
    SET: entityTypeColors.SET,
    TRANSFORMER: entityTypeColors.TRANSFORMER,
    CONSUMER: entityTypeColors.CONSUMER,
    INPUT: entityTypeColors.INPUT,
    QUALITY_TEST: entityTypeColors.QUALITY_TEST,
  },
  runStatus: {
    SUCCESS: runStatusColors.SUCCESS,
    FAILED: runStatusColors.FAILED,
    BROKEN: runStatusColors.BROKEN,
    SKIPPED: runStatusColors.SKIPPED,
    ABORTED: runStatusColors.ABORTED,
    UNKNOWN: runStatusColors.UNKNOWN,
  },
  reportStatus: {
    success: {
      background: reportStatusColors.success.background,
      border: reportStatusColors.success.border,
    },
    failed: {
      background: reportStatusColors.failed.background,
      border: reportStatusColors.failed.border,
    },
    broken: {
      background: reportStatusColors.broken.background,
      border: reportStatusColors.broken.border,
    },
    skipped: {
      background: reportStatusColors.skipped.background,
      border: reportStatusColors.skipped.border,
    },
    aborted: {
      background: reportStatusColors.aborted.background,
      border: reportStatusColors.aborted.border,
    },
    unknown: {
      background: reportStatusColors.unknown.background,
      border: reportStatusColors.unknown.border,
    },
  },
} as ODDPaletteOptions);
