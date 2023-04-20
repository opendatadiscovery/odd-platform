import React from 'react';
import { type ToastType } from 'react-hot-toast';
import { Typography } from '@mui/material';
import AlertIcon from 'components/shared/icons/AlertIcon';
import ClearIcon from 'components/shared/icons/ClearIcon';
import InfoIcon from 'components/shared/icons/InfoIcon';
import AppIconButton from 'components/shared/elements/AppIconButton/AppIconButton';
import * as S from 'components/shared/elements/AppToast/AppToastStyles';

interface AppToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
}
const AppToast: React.FC<AppToastProps> = ({ type, onClose, message }) => {
  const toastIcon = React.useMemo(() => {
    if (type === 'success') return <InfoIcon width={24} height={24} />;
    if (type === 'error') return <AlertIcon width={24} height={24} />;

    return null;
  }, [type]);

  return (
    <S.Container $type={type} alignItems={message.length > 44 ? 'flex-start' : 'center'}>
      {toastIcon}
      <Typography
        variant='body2'
        sx={{ ml: 1, mr: 2, flexGrow: 1, wordBreak: 'break-word' }}
      >
        {message}
      </Typography>
      <AppIconButton
        sx={{ py: '4px !important' }}
        size='small'
        color='unfilled'
        icon={<ClearIcon />}
        onClick={onClose}
      />
    </S.Container>
  );
};

export default AppToast;
