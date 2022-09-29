import { CircularProgress, Theme } from '@mui/material';
import React from 'react';
import { AlertIcon, CopyIcon, SuccessIcon } from 'components/shared/Icons';
import { AppButton, AppIconButton } from 'components/shared';
import { SxProps } from '@mui/system';

interface CopyButtonProps {
  text?: string;
  fallbackText?: string;
  popupText?: string;
  stringToCopy: string;
  msDelay?: number;
  sx?: SxProps<Theme> | undefined;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  text = '',
  fallbackText = 'Copying',
  popupText = 'Copied!',
  stringToCopy,
  msDelay = 3000,
  sx,
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
      sx={sx}
    >
      {buttonText}
    </AppButton>
  ) : (
    <AppIconButton
      icon={buttonIcon}
      color="tertiary"
      onClick={copyToClipboard}
      sx={sx}
    />
  );
};

export default CopyButton;
