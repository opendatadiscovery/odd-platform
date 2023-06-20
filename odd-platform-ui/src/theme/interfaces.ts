import type { TypeBackground } from '@mui/material/styles/createPalette';
import type {
  AlertStatus,
  DataEntityClassNameEnum,
  DataEntityRunStatus,
  DataQualityTestSeverity,
  DataSetFieldTypeTypeEnum,
  SLAColour,
  OwnerAssociationRequestStatus,
} from 'generated-sources';
import type { TypographyStyle } from '@mui/material';
import type { TypographyStyleOptions } from '@mui/material/styles/createTypography';
import type { ToastType } from 'react-hot-toast';
import type { DatasetFieldKey as DatasetFieldKeyType } from 'lib/interfaces';
import type {
  ButtonColor,
  ButtonFont,
} from 'components/shared/elements/Button/interfaces';

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

type Input = ItemCondition & {
  label: ItemColors;
  hint: ItemColors;
  searchLg: ItemCondition;
};

type EntityClasses = Record<DataEntityClassNameEnum, string>;

type StructureLabel = Record<DataSetFieldTypeTypeEnum, ItemColors>;

type ReportStatus = Record<DataEntityRunStatus, ItemColors>;

type RunStatus = Record<DataEntityRunStatus, ItemColors>;

type AssociationRequestStatus = Record<OwnerAssociationRequestStatus, ItemColors>;

type SLAStatus = Record<DataQualityTestSeverity | SLAColour, string>;

interface TextType {
  primary: string;
  secondary: string;
  info: string;
  hint: string;
  action: string;
}

interface Border {
  primary: string;
  secondary: string;
  tertiary: string;
  element: string;
  light: string;
}

type ButtonAnimationParams = { loaderBg?: { start: string; end: string } };

type Button = Record<ButtonColor, ItemCondition & ButtonAnimationParams>;

interface Background extends TypeBackground {
  primary: string;
  secondary: string;
  tertiary: string;
  darken: string;
  element: string;
  transparent: string;
}

interface Tag {
  main: ItemCondition;
  important: ItemCondition;
}

type Alert = Record<AlertStatus, ItemColors>;

type DatasetFieldKey = Record<DatasetFieldKeyType, ItemColors>;

interface ActivityEvent {
  created: string;
  updated: string;
  deleted: string;
}

type Toast = Record<ToastType, string>;

interface SwitchColors {
  checked: string;
  track: string;
  thumb: string;
}

declare module '@mui/material/styles' {
  interface Palette {
    entityClass: EntityClasses;
    reportStatus: ReportStatus;
    runStatus: RunStatus;
    associationRequestStatus: AssociationRequestStatus;
    button: Button;
    tag: Tag;
    structureLabel: StructureLabel;
    alert: Alert;
    datasetFieldKey: DatasetFieldKey;
    backgrounds: Partial<Background>;
    texts: TextType;
    textField: ItemCondition;
    activityEvent: ActivityEvent;
    slaStatus: SLAStatus;
    border: Border;
    toast: Toast;
    switch: SwitchColors;
    attachment: ItemCondition;
    fileInput: ItemCondition;
    input: Input;
  }

  interface PaletteOptions {
    entityClass?: EntityClasses;
    reportStatus?: ReportStatus;
    runStatus?: RunStatus;
    associationRequestStatus?: AssociationRequestStatus;
    button?: Button;
    tag?: Tag;
    structureLabel?: StructureLabel;
    alert?: Alert;
    datasetFieldKey?: DatasetFieldKey;
    backgrounds?: Partial<Background>;
    texts?: TextType;
    textField?: ItemCondition;
    activityEvent?: ActivityEvent;
    slaStatus: SLAStatus;
    border: Border;
    toast: Toast;
    switch: SwitchColors;
    input: Input;
    attachment: ItemCondition;
    fileInput: ItemCondition;
  }
}

// typography interfaces
declare module '@mui/material/styles/createTypography' {
  interface Typography extends Record<ButtonFont, TypographyStyle> {
    errorCode: TypographyStyle;
    totalCountTitle: TypographyStyle;
    h0: TypographyStyle;
  }

  interface TypographyOptions extends Record<ButtonFont, TypographyStyle> {
    errorCode?: TypographyStyleOptions;
    totalCountTitle?: TypographyStyleOptions;
    h0?: TypographyStyleOptions;
  }
}
declare module '@mui/material/Typography/Typography' {
  interface TypographyPropsVariantOverrides extends Record<ButtonFont, true> {
    errorCode: true;
    totalCountTitle: true;
    h0: true;
  }
}
