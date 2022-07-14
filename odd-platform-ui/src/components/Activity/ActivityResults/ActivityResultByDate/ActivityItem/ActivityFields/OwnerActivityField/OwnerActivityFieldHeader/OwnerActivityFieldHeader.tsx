import ActivityCreatedIcon from 'components/shared/Icons/ActivityCreatedIcon';
import { Typography } from '@mui/material';
import OwnerWithRole from 'components/Activity/ActivityResults/ActivityResultByDate/ActivityItem/ActivityFields/OwnerActivityField/OwnerWithRole/OwnerWithRole';
import AppButton from 'components/shared/AppButton/AppButton';
import React from 'react';
import { ActivityEventType } from 'generated-sources';
import ActivityUpdatedIcon from 'components/shared/Icons/ActivityUpdatedIcon';
import ActivityDeletedIcon from 'components/shared/Icons/ActivityDeletedIcon';
import * as S from './OwnerActivityFieldHeaderStyles';

interface OwnerActivityFieldHeaderProps {
  ownerName: string | undefined;
  roleName: string | undefined;
  eventType: ActivityEventType;
  showDetailsBtn?: boolean;
  detailsBtnOnClick?: () => void;
  isDetailsOpen?: boolean;
}

const OwnerActivityFieldHeader: React.FC<
  OwnerActivityFieldHeaderProps
> = ({
  ownerName,
  roleName,
  showDetailsBtn,
  detailsBtnOnClick,
  isDetailsOpen,
  eventType,
}) => {
  const [headerContent, setHeaderContent] = React.useState<{
    icon: JSX.Element | null;
    eventType: string;
  }>({
    icon: null,
    eventType: '',
  });

  React.useEffect(() => {
    if (eventType.includes('CREATED')) {
      setHeaderContent({
        icon: <ActivityCreatedIcon />,
        eventType: 'created',
      });
    }
    if (eventType.includes('UPDATED')) {
      setHeaderContent({
        icon: <ActivityUpdatedIcon />,
        eventType: 'updated',
      });
    }
    if (eventType.includes('DELETED')) {
      setHeaderContent({
        icon: <ActivityDeletedIcon />,
        eventType: 'deleted',
      });
    }
  }, [eventType]);

  return (
    <S.FieldHeader container>
      {headerContent.icon}
      <Typography variant="subtitle1" color="texts.info">
        Owner
      </Typography>
      <OwnerWithRole
        ownerName={ownerName}
        roleName={roleName}
        ownerTypographyVariant="h4"
      />
      <Typography variant="subtitle1" color="texts.info">
        was
      </Typography>
      <Typography variant="h4">{headerContent.eventType}</Typography>
      {showDetailsBtn && (
        <AppButton
          size="small"
          color="tertiary"
          onClick={detailsBtnOnClick}
          sx={{ position: 'inherit' }}
        >
          {isDetailsOpen ? 'Hide details' : `Show details`}
        </AppButton>
      )}
    </S.FieldHeader>
  );
};

export default OwnerActivityFieldHeader;
