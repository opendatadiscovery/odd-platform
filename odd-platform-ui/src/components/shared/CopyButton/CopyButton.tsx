import React from 'react';
import AppButton from '../AppButton/AppButton';
import { ButtonColors } from '../AppButton/AppButtonStyles';
import AppIconButton from '../AppIconButton/AppIconButton';
import { IconButtonColors } from '../AppIconButton/AppIconButtonStyles';
import { DelayText } from './CopyButtonStyles';

interface CopyButtonProps {
  text?: string | React.ReactNode;
  eventCopyText?: string | React.ReactNode;
  color: ButtonColors | IconButtonColors;
  icon: React.ReactNode;
  copyString: string;
  msDelay?: number;
}
const CopyButton: React.FC<CopyButtonProps> = ({
  text = 'Copy',
  eventCopyText = 'Copied!',
  color,
  icon,
  copyString,
  msDelay = 1000,
}) => {
  const [error, setError] = React.useState<string>('');
  const [showCopy, setShowCopy] = React.useState<boolean>(false);

  const copyToClipboard = async () => {
    try {
      setTimeout(() => setShowCopy(false), msDelay);
      await navigator.clipboard.writeText(copyString);
      setError('');
      setShowCopy(true);
    } catch (e) {
      // no navigator.clipboard
      if (e instanceof Error) setError(e.message);
      else setError('Error happened.');
      setShowCopy(true);
    }
  };
  return text ? (
    <AppButton color={color as ButtonColors} onClick={copyToClipboard}>
      {icon}
      {text}
      {showCopy && (
        <DelayText component="span">{error || eventCopyText}</DelayText>
      )}
    </AppButton>
  ) : (
    <AppIconButton
      icon={icon}
      color={color as IconButtonColors}
      onClick={copyToClipboard}
    />
  );
};

export default CopyButton;
