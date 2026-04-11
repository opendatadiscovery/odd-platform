import type { Button, ButtonColor, ButtonFont, ButtonSize } from './interfaces';

export const getButtonType = (color: ButtonColor, size: ButtonSize, icon?: boolean) => {
  if (icon) return `${color}-${size}-icon` as Button;

  return `${color}-${size}` as Button;
};

export const getButtonFontType = (color: ButtonColor, size: ButtonSize) =>
  `button-${color}-${size}` as ButtonFont;
