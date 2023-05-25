import { CircularProgress } from '@mui/material';
import React from 'react';
import { AlertIcon, CopyIcon, SuccessIcon } from 'components/shared/icons';
import { type SxProps, type Theme } from '@mui/system';
import Button from 'components/shared/elements/Button/Button';
import type { Button as ButtonType } from 'components/shared/elements/Button/interfaces';

interface CopyButtonProps {
  text?: string;
  fallbackText?: string;
  popupText?: string;
  stringToCopy: string;
  msDelay?: number;
  sx?: SxProps<Theme>;
  buttonType?: ButtonType;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  text = '',
  fallbackText = 'Copying',
  popupText = 'Copied!',
  stringToCopy,
  msDelay = 3000,
  buttonType,
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

  return (
    <Button
      text={text}
      buttonType={buttonType || 'tertiary-m'}
      onClick={copyToClipboard}
      startIcon={text ? buttonIcon : undefined}
      icon={text ? undefined : buttonIcon}
      sx={sx}
    >
      {buttonText}
    </Button>
  );
};

export default CopyButton;
