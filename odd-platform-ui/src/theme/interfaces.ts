import {
  Palette,
  PaletteOptions,
  TypeBackground,
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
  disabled?: ItemColors;
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

interface StructureLabelType {
  STRING: ItemColors;
  BOOLEAN: ItemColors;
  INTEGER: ItemColors;
  NUMBER: ItemColors;
  BINARY: ItemColors;
  DATETIME: ItemColors;
  STRUCT: ItemColors;
  LIST: ItemColors;
  MAP: ItemColors;
}

interface TextType {
  primary: string;
  secondary: string;
  info: string;
  hint: string;
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

interface BackgroundType extends TypeBackground {
  primary: string;
  secondary: string;
  darken: string;
}

interface TagType {
  main: ButtonTypeCondition;
  important: ButtonTypeCondition;
}

interface AlertType {
  open: ItemColors;
  resolved: ItemColors;
}

export interface ODDPalette extends Omit<Palette, 'text' | 'background'> {
  entityType?: EntityType;
  reportStatus?: ReportStatus;
  runStatus?: RunStatus;
  button?: ButtonType;
  tag?: TagType;
  structureLabel?: StructureLabelType;
  alert?: AlertType;
  text: Partial<TextType>;
  background: Partial<BackgroundType>;
}

export interface ODDPaletteOptions
  extends Omit<PaletteOptions, 'divider'> {
  entityType: EntityType;
  reportStatus: ReportStatus;
  runStatus: RunStatus;
  button: ButtonType;
  tag: TagType;
  structureLabel: StructureLabelType;
  alert: AlertType;
  text: TextType;
  background: Partial<BackgroundType>;
}

// theme interfaces
export interface ODDTheme extends Omit<Theme, 'palette'> {
  palette: ODDPalette;
}
export interface ODDThemeOptions extends Omit<ThemeOptions, 'palette'> {
  palette: ODDPaletteOptions;
}
