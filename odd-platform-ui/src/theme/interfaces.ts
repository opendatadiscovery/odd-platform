import { TypeBackground } from '@mui/material/styles/createPalette';
import {
  AlertStatus,
  DataEntityClassNameEnum,
  DataEntityRunStatus,
  DataQualityTestSeverity,
  DataSetFieldTypeTypeEnum,
} from 'generated-sources';
import { TypographyStyle } from '@mui/material';
import { TypographyStyleOptions } from '@mui/material/styles/createTypography';

// helpers interfaces
export type CSSObject = Partial<CSSStyleDeclaration>;

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

type EntityClasses = Record<DataEntityClassNameEnum, string>;

type StructureLabelType = Record<DataSetFieldTypeTypeEnum, ItemColors>;

type ReportStatus = Record<DataEntityRunStatus, ItemColors>;

type RunStatus = Record<DataEntityRunStatus, ItemColors>;

type SLAStatus = Record<
  DataQualityTestSeverity,
  { normal: string; light: string }
>;

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

interface DatasetFieldKeyType {
  primary: ItemColors;
  sort: ItemColors;
}

interface ActivityEventType {
  created: string;
  updated: string;
  deleted: string;
}

declare module '@mui/material/styles' {
  interface Palette {
    entityClass: EntityClasses;
    reportStatus: ReportStatus;
    runStatus: RunStatus;
    button: ButtonType;
    tag: TagType;
    structureLabel: StructureLabelType;
    alert: AlertType;
    datasetFieldKey: DatasetFieldKeyType;
    backgrounds: Partial<BackgroundType>;
    texts: TextType;
    textField: ItemCondition;
    activityEvent: ActivityEventType;
    slaStatus: SLAStatus;
  }

  interface PaletteOptions {
    entityClass?: EntityClasses;
    reportStatus?: ReportStatus;
    runStatus?: RunStatus;
    button?: ButtonType;
    tag?: TagType;
    structureLabel?: StructureLabelType;
    alert?: AlertType;
    datasetFieldKey?: DatasetFieldKeyType;
    backgrounds?: Partial<BackgroundType>;
    texts?: TextType;
    textField?: ItemCondition;
    activityEvent?: ActivityEventType;
    slaStatus?: SLAStatus;
  }
}

// typography interfaces
declare module '@mui/material/styles/createTypography' {
  interface Typography {
    errorCode: TypographyStyle;
    totalCountTitle: TypographyStyle;
  }

  interface TypographyOptions {
    errorCode?: TypographyStyleOptions;
    totalCountTitle?: TypographyStyleOptions;
  }
}
declare module '@mui/material/Typography/Typography' {
  interface TypographyPropsVariantOverrides {
    errorCode: true;
    totalCountTitle: true;
  }
}
