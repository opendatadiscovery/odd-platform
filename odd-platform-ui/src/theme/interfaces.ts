// palette interfaces
import { TypeBackground } from '@mui/material/styles/createPalette';

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
  SUCCESS: string;
  FAILED: string;
  BROKEN: string;
  SKIPPED: string;
  ABORTED: string;
  UNKNOWN: string;
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

declare module '@mui/material/styles' {
  interface Palette {
    entityType: EntityType;
    reportStatus: ReportStatus;
    runStatus: RunStatus;
    button: ButtonType;
    tag: TagType;
    structureLabel: StructureLabelType;
    alert: AlertType;
    backgrounds: Partial<BackgroundType>;
    texts: TextType;
  }
  interface PaletteOptions {
    entityType?: EntityType;
    reportStatus?: ReportStatus;
    runStatus?: RunStatus;
    button?: ButtonType;
    tag?: TagType;
    structureLabel?: StructureLabelType;
    alert?: AlertType;
    backgrounds?: Partial<BackgroundType>;
    texts?: TextType;
  }
}
