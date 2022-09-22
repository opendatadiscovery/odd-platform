import React from 'react';
import { Typography } from '@mui/material';
import AppButton from 'components/shared/AppButton/AppButton';
import { CRUDType } from 'lib/interfaces';
import { useSetActivityHeaderIcon } from 'lib/hooks';
import * as S from './ActivityFieldHeaderStyles';

interface ActivityFieldHeaderProps {
  startText: string;
  activityName: string | JSX.Element | undefined;
  eventType: CRUDType | string;
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
  const { icon } = useSetActivityHeaderIcon(eventType);

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
        {plural ? 'were' : 'was'}
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
