import React from 'react';
import { Grid, Typography } from '@mui/material';
import { WaitIcon } from 'components/shared/Icons';
import { OwnerAssociationRequestStatus } from 'generated-sources';
import RequestAcceptedIcon from 'components/shared/Icons/RequestAcceptedIcon';
import RequestDeclinedIcon from 'components/shared/Icons/RequestDeclinedIcon';
import { AppButton } from 'components/shared';
import { useLocalStorage } from 'lib/hooks/useLocalStorage';
import * as S from './OwnerAssociationRequestInfoStyles';

interface Props {
  status?: OwnerAssociationRequestStatus;
}

const OwnerAssociationRequestInfo: React.FC<Props> = ({ status }) => {
  const { setLocalStorageValue } = useLocalStorage();
  let icon = null;
  let mainText = '';
  let additionalText = '';
  let buttonText = null;

  if (status === OwnerAssociationRequestStatus.PENDING) {
    icon = <WaitIcon />;
    mainText = "Owner's synchronization request is being checked";
    additionalText = 'Wait for the administrator to review the request';
  }

  if (status === OwnerAssociationRequestStatus.APPROVED) {
    icon = <RequestAcceptedIcon />;
    mainText = 'Your request was accepted';
    additionalText = 'Now you can edit the data of the entities.';
    buttonText = 'Ok, i got it';
  }

  if (status === OwnerAssociationRequestStatus.DECLINED) {
    icon = <RequestDeclinedIcon />;
    mainText = 'Your request was rejected';
    additionalText = 'Contact your system administrator';
    buttonText = 'Send another request';
  }

  const handleOnClick = () => {
    setLocalStorageValue('showAssociationAcceptedMessage', true);
  };

  return (
    <S.Container>
      <Grid
        container
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        {icon}
        <Typography variant="h3">{mainText}</Typography>
        <Typography variant="subtitle1">{additionalText}</Typography>
        {buttonText && (
          <AppButton
            sx={{ mt: 3 }}
            color="primaryLight"
            size="large"
            onClick={handleOnClick}
          >
            {buttonText}
          </AppButton>
        )}
      </Grid>
    </S.Container>
  );
};

export default OwnerAssociationRequestInfo;
