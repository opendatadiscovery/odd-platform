export enum ButtonSizeEnum {
  sm = 'sm',
  m = 'm',
  lg = 'lg',
}

export enum ButtonColorEnum {
  main = 'main',
  secondary = 'secondary',
  secondarySuccess = 'secondarySuccess',
  secondaryWarning = 'secondaryWarning',
  tertiary = 'tertiary',
  link = 'link',
  linkGray = 'linkGray',
  expand = 'expand',
  service = 'service',
}

export type ButtonSize = `${ButtonSizeEnum}`;
export type ButtonColor = `${ButtonColorEnum}`;

type TextButton =
  | `${ButtonColorEnum.main}-${ButtonSizeEnum.lg}`
  | `${ButtonColorEnum.main}-${ButtonSizeEnum.m}`
  | `${ButtonColorEnum.secondary}-${ButtonSizeEnum.lg}`
  | `${ButtonColorEnum.secondary}-${ButtonSizeEnum.m}`
  | `${ButtonColorEnum.secondarySuccess}-${ButtonSizeEnum.m}`
  | `${ButtonColorEnum.secondaryWarning}-${ButtonSizeEnum.m}`
  | `${ButtonColorEnum.secondary}-${ButtonSizeEnum.sm}`
  | `${ButtonColorEnum.tertiary}-${ButtonSizeEnum.m}`
  | `${ButtonColorEnum.tertiary}-${ButtonSizeEnum.sm}`
  | `${ButtonColorEnum.link}-${ButtonSizeEnum.m}`
  | `${ButtonColorEnum.linkGray}-${ButtonSizeEnum.m}`
  | `${ButtonColorEnum.service}-${ButtonSizeEnum.m}`;

type IconButton =
  | `${ButtonColorEnum.secondary}-${ButtonSizeEnum.m}-icon`
  | `${ButtonColorEnum.secondary}-${ButtonSizeEnum.sm}-icon`
  | `${ButtonColorEnum.tertiary}-${ButtonSizeEnum.m}-icon`
  | `${ButtonColorEnum.expand}-${ButtonSizeEnum.sm}-icon`
  | `${ButtonColorEnum.linkGray}-${ButtonSizeEnum.m}-icon`;

export type Button = TextButton | IconButton;

export type ButtonFont = `button-${TextButton}`;
