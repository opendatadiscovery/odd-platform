import { CircularProgress } from '@mui/material';
import React from 'react';
import AppButton from '../AppButton/AppButton';
import { ButtonColors } from '../AppButton/AppButtonStyles';
import AppIconButton from '../AppIconButton/AppIconButton';
import { IconButtonColors } from '../AppIconButton/AppIconButtonStyles';
import AddIcon from '../Icons/AddIcon';
import { Text, Positions } from './CopyButtonStyles';

interface CopyButtonProps {
  text?: string;
  fallbackText?: string;
  eventCopyText?: string;
  color: ButtonColors | IconButtonColors;
  icon: React.ReactNode;
  copyString: string;
  msDelay?: number;
  position?: Positions;
}
const CopyButton: React.FC<CopyButtonProps> = ({
  text = '',
  fallbackText = 'Copying',
  eventCopyText = 'Copied!',
  color,
  icon,
  copyString,
  msDelay = 1000,
  position = 'right',
}) => {
  const [error, setError] = React.useState<string>('');
  const [showCopy, setShowCopy] = React.useState<boolean>(false);
  const [showCopying, setShowCopying] = React.useState<boolean>(false);
  const copyToClipboard = async () => {
    const copy = new Promise<void>((resolve, reject) => {
      try {
        resolve();
      } catch (e) {
        reject(e);
      }
    });
    // copy-> copying -> copied
    copy
      .then(async () => {
        setShowCopying(true);
        await navigator.clipboard.writeText(copyString);
        setShowCopying(false);
      })
      .then(async () => {
        setShowCopy(true);
        setTimeout(() => setShowCopy(false), msDelay * 3);
      })
      .catch(value => setError(value)) // no navigator.clipboard
      .finally(() => setShowCopying(false));
  };
  let buttonIcon = icon;
  let tooltipText = text;
  if (showCopy) {
    buttonIcon = <AddIcon sx={{ p: 0, m: 0 }} />;
    tooltipText = error || eventCopyText;
  } else if (showCopying) {
    buttonIcon = <CircularProgress size={16} />;
    tooltipText = fallbackText;
  }
  const buttonText = (
    <Text
      onClick={copyToClipboard}
      $color={color as ButtonColors}
      variant="body1"
    >
      {tooltipText}
    </Text>
  );
  const buttonWithText = () => {
    switch (position) {
      case 'top':
        return (
          <AppButton
            color={color as ButtonColors}
            onClick={copyToClipboard}
            sx={{ display: 'block' }}
          >
            {buttonText}
            {buttonIcon}
          </AppButton>
        );
      case 'bottom':
        return (
          <AppButton
            color={color as ButtonColors}
            onClick={copyToClipboard}
            sx={{ display: 'block' }}
          >
            {buttonIcon}
            {buttonText}
          </AppButton>
        );
      case 'left':
        return (
          <AppButton
            color={color as ButtonColors}
            onClick={copyToClipboard}
          >
            {buttonText}
            {buttonIcon}
          </AppButton>
        );
      default:
        // case 'right'
        return (
          <AppButton
            color={color as ButtonColors}
            onClick={copyToClipboard}
          >
            {buttonIcon}
            {buttonText}
          </AppButton>
        );
    }
  };
  return text ? (
    buttonWithText()
  ) : (
    <AppIconButton
      icon={buttonIcon}
      color={color as IconButtonColors}
      onClick={copyToClipboard}
    />
  );
};

export default CopyButton;
