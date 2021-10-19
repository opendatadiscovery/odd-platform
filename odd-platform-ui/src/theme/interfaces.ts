import { TypeBackground } from '@mui/material/styles/createPalette';
import {
  AlertStatus,
  DataEntityTypeNameEnum,
  DataSetFieldTypeTypeEnum,
} from 'generated-sources';

// palette interfaces
interface ItemColors {
  background?: string;
  border?: string;
  color?: string;
}

interface ItemCondition {
  normal: ItemColors;
  hover: ItemColors;
  active: ItemColors;
  error?: ItemColors;
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

type EntityType = Record<DataEntityTypeNameEnum, string>;

type StructureLabelType = Record<DataSetFieldTypeTypeEnum, ItemColors>;

interface TextType {
  primary: string;
  secondary: string;
  info: string;
  hint: string;
}

interface ButtonType {
  primary: ItemCondition;
  primaryLight: ItemCondition;
  secondary: ItemCondition;
  tertiary: ItemCondition;
  dropdown: ItemCondition;
  expand: ItemCondition;
  expandText: ItemCondition;
  unfilled: ItemCondition;
  collapse: ItemCondition;
}

interface BackgroundType extends TypeBackground {
  primary: string;
  secondary: string;
  darken: string;
}

interface TagType {
  main: ItemCondition;
  important: ItemCondition;
}

type AlertType = Record<AlertStatus, ItemColors>;

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
    textField: ItemCondition;
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
    textField?: ItemCondition;
  }
}
