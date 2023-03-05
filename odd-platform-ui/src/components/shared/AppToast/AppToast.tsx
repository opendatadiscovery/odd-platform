import React from 'react';
import { type ToastType } from 'react-hot-toast';
import { Typography } from '@mui/material';
import AlertIcon from '../Icons/AlertIcon';
import ClearIcon from '../Icons/ClearIcon';
import InfoIcon from '../Icons/InfoIcon';
import AppIconButton from '../AppIconButton/AppIconButton';
import * as S from './AppToastStyles';

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
