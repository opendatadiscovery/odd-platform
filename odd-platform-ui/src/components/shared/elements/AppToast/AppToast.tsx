import React from 'react';
import { type ToastType } from 'react-hot-toast';
import { Typography } from '@mui/material';
import AlertIcon from 'components/shared/icons/AlertIcon';
import ClearIcon from 'components/shared/icons/ClearIcon';
import InfoIcon from 'components/shared/icons/InfoIcon';
import Button from 'components/shared/elements/Button/Button';
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
      <Button
        sx={{ py: '4px !important' }}
        buttonType='linkGray-m'
        icon={<ClearIcon />}
        onClick={onClose}
      />
    </S.Container>
  );
};

export default AppToast;
