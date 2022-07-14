import React from 'react';
import { Typography } from '@mui/material';
import ActivityCreatedIcon from 'components/shared/Icons/ActivityCreatedIcon';
import ActivityUpdatedIcon from 'components/shared/Icons/ActivityUpdatedIcon';
import ActivityDeletedIcon from 'components/shared/Icons/ActivityDeletedIcon';
import AppButton from 'components/shared/AppButton/AppButton';
import * as S from './ActivityFieldHeaderStyles';

interface ActivityFieldHeaderProps {
  startText: string;
  activityName: string | undefined;
  eventType: 'created' | 'updated' | 'deleted' | string;
  showDetailsBtn?: boolean;
  detailsBtnOnClick?: () => void;
  isDetailsOpen?: boolean;
}

const ActivityFieldHeader: React.FC<ActivityFieldHeaderProps> = ({
  startText,
  activityName,
  eventType,
  showDetailsBtn,
  detailsBtnOnClick,
  isDetailsOpen,
}) => {
  const [icon, setHeaderIcon] = React.useState<JSX.Element | null>(null);

  React.useEffect(() => {
    if (eventType === 'created') {
      setHeaderIcon(<ActivityCreatedIcon />);
    }
    if (eventType === 'updated') {
      setHeaderIcon(<ActivityUpdatedIcon />);
    }
    if (eventType === 'deleted') {
      setHeaderIcon(<ActivityDeletedIcon />);
    }
  }, [eventType]);

  return (
    <S.FieldHeader container>
      {icon}
      {startText && (
        <Typography variant="subtitle1" color="texts.info">
          {startText}
        </Typography>
      )}
      <Typography variant="h4">{activityName}</Typography>
      <Typography variant="subtitle1" color="texts.info">
        was
      </Typography>
      <Typography variant="h4">{eventType}</Typography>
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
export default ActivityFieldHeader;
