export enum InputSizeEnum {
  sm = 'sm',
  m = 'm',
  lg = 'lg',
}

export enum InputTypeEnum {
  main = 'main',
  search = 'search',
}

export type InputSize = `${InputSizeEnum}`;
export type InputType = `${InputTypeEnum}`;

export type InputVariant =
  | `${InputTypeEnum.main}-${InputSizeEnum.m}`
  | `${InputTypeEnum.main}-${InputSizeEnum.sm}`
  | `${InputTypeEnum.search}-${InputSizeEnum.lg}`
  | `${InputTypeEnum.search}-${InputSizeEnum.m}`;
