import React from 'react';
import { Typography } from '@mui/material';
import type { EventType } from 'lib/interfaces';
import { useActivityHeaderIcon } from 'lib/hooks';
import * as S from 'components/shared/elements/Activity/ActivityFields/ActivityFieldHeader/ActivityFieldHeaderStyles';
import Button from 'components/shared/elements/Button/Button';

interface ActivityFieldHeaderProps {
  startText: string;
  activityName: string | JSX.Element | undefined;
  eventType: EventType;
  showDetailsBtn?: boolean;
  detailsBtnOnClick?: () => void;
  isDetailsOpen?: boolean;
  plural?: boolean;
}

const ActivityFieldHeader: React.FC<ActivityFieldHeaderProps> = ({
  startText,
  activityName,
  eventType,
  showDetailsBtn,
  detailsBtnOnClick,
  isDetailsOpen,
  plural,
}) => {
  const icon = useActivityHeaderIcon(eventType);

  return (
    <S.FieldHeader container>
      {icon}
      {startText && (
        <Typography variant='subtitle1' color='texts.info'>
          {startText}
        </Typography>
      )}
      <Typography variant='h4'>{activityName}</Typography>
      <Typography variant='subtitle1' color='texts.info'>
        {plural ? 'were' : 'was'}
      </Typography>
      <Typography variant='h4'>{eventType}</Typography>
      {showDetailsBtn && (
        <Button
          text={isDetailsOpen ? 'Hide details' : `Show details`}
          buttonType='tertiary-m'
          onClick={detailsBtnOnClick}
          sx={{ position: 'inherit' }}
        />
      )}
    </S.FieldHeader>
  );
};
export default ActivityFieldHeader;
