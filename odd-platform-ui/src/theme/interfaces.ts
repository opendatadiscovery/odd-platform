import { TypeBackground } from '@mui/material/styles/createPalette';
import {
  AlertStatus,
  DataEntityTypeNameEnum,
  DataQualityTestRunStatusEnum,
  DataSetFieldTypeTypeEnum,
} from 'generated-sources';
import { TypographyStyle } from '@mui/material';
import { TypographyStyleOptions } from '@mui/material/styles/createTypography';

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

type EntityType = Record<DataEntityTypeNameEnum, string>;

type StructureLabelType = Record<DataSetFieldTypeTypeEnum, ItemColors>;

type ReportStatus = Record<DataQualityTestRunStatusEnum, ItemColors>;

type RunStatus = Record<DataQualityTestRunStatusEnum, string>;

interface TextType {
  primary: string;
  secondary: string;
  info: string;
  hint: string;
  action: string;
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
  valueCount: ItemCondition;
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

// typography interfaces
declare module '@mui/material/styles/createTypography' {
  interface Typography {
    errorCode: TypographyStyle;
  }
  interface TypographyOptions {
    errorCode?: TypographyStyleOptions;
  }
}
declare module '@mui/material/Typography/Typography' {
  interface TypographyPropsVariantOverrides {
    errorCode: true;
  }
}
