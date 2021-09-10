import {
  Palette,
  PaletteOptions,
} from '@material-ui/core/styles/createPalette';
import { Theme } from '@material-ui/core';
import { ThemeOptions } from '@material-ui/core/styles';

// palette interfaces
interface ItemColors {
  background?: string;
  border?: string;
  color?: string;
}

interface ButtonTypeCondition {
  normal: ItemColors;
  hover: ItemColors;
  active: ItemColors;
  disabled: ItemColors;
}

interface ReportStatus {
  success: ItemColors;
  failed: ItemColors;
  broken: ItemColors;
  skipped: ItemColors;
  aborted: ItemColors;
  unknown: ItemColors;
}

interface RunStatus {
  success: string;
  failed: string;
  broken: string;
  skipped: string;
  aborted: string;
  unknown: string;
}

interface EntityType {
  SET: string;
  TRANSFORMER: string;
  CONSUMER: string;
  INPUT: string;
  QUALITY_TEST: string;
}

interface ButtonType {
  primary: ButtonTypeCondition;
  primaryLight: ButtonTypeCondition;
  secondary: ButtonTypeCondition;
  tertiary: ButtonTypeCondition;
  dropdown: ButtonTypeCondition;
  expand: ButtonTypeCondition;
  unfilled: ButtonTypeCondition;
}

export interface ODDPalette extends Palette {
  entityType?: EntityType;
  reportStatus?: ReportStatus;
  runStatus?: RunStatus;
  button?: ButtonType;
}

export interface ODDPaletteOptions extends PaletteOptions {
  entityType?: EntityType;
  reportStatus?: ReportStatus;
  runStatus?: RunStatus;
  button?: ButtonType;
}

// theme interfaces
export interface ODDTheme extends Theme {
  palette: ODDPalette;
}
export interface ODDThemeOptions extends ThemeOptions {
  palette?: ODDPalette;
}
