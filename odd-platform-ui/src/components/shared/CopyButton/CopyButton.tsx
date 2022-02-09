import { CircularProgress } from '@mui/material';
import React from 'react';
import AppButton from '../AppButton/AppButton';
import AppIconButton from '../AppIconButton/AppIconButton';
import AlertIcon from '../Icons/AlertIcon';
import CopyIcon from '../Icons/CopyIcon';
import SuccessIcon from '../Icons/SuccessIcon';

interface CopyButtonProps {
  text?: string;
  fallbackText?: string;
  popupText?: string;
  stringToCopy: string;
  msDelay?: number;
}
const CopyButton: React.FC<CopyButtonProps> = ({
  text = '',
  fallbackText = 'Copying',
  popupText = 'Copied!',
  stringToCopy,
  msDelay = 3000,
}) => {
  const [error, setError] = React.useState<string>('');
  const [showCopy, setShowCopy] = React.useState<boolean>(false);
  const [showCopying, setShowCopying] = React.useState<boolean>(false);
  const copyToClipboard = async () => {
    // copy(text)-> copying(fallbackText) -> copied(popupText) -> copy(text)
    setShowCopying(true);
    await navigator.clipboard
      .writeText(stringToCopy)
      .finally(async () => {
        setShowCopying(false);
        setShowCopy(true);
        setTimeout(() => {
          setShowCopy(false);
          setError('');
        }, msDelay);
      })
      .catch(() => setError('Copy error')); // no navigator.clipboard
  };
  let buttonIcon = <CopyIcon />;
  let buttonText = text;
  if (showCopy) {
    buttonIcon = error ? <AlertIcon /> : <SuccessIcon />;
    buttonText = error || popupText;
  } else if (showCopying) {
    buttonIcon = <CircularProgress size={16} />;
    buttonText = fallbackText;
  }
  return text ? (
    <AppButton
      color="tertiary"
      onClick={copyToClipboard}
      startIcon={buttonIcon}
    >
      {buttonText}
    </AppButton>
  ) : (
    <AppIconButton
      icon={buttonIcon}
      color="tertiary"
      onClick={copyToClipboard}
    />
  );
};

export default CopyButton;
