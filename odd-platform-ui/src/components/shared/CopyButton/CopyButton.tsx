import { CircularProgress } from '@mui/material';
import React from 'react';
import CopyIcon from 'components/shared/Icons/CopyIcon';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import AlertIcon from 'components/shared/Icons/AlertIcon';
import SuccessIcon from 'components/shared/Icons/SuccessIcon';
import AppButton from 'components/shared/AppButton/AppButton';

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
  const copyToClipboard = () => {
    const showCopyTimeout = () => {
      setShowCopying(false);
      setShowCopy(true);
      setTimeout(() => {
        setShowCopy(false);
        setError('');
      }, msDelay);
    };

    setShowCopying(true);
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(stringToCopy)
        .finally(showCopyTimeout)
        .catch(() => setError('Copy error'));
    } else {
      setError('Copy error');
      showCopyTimeout();
    }
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
