import React from 'react';
import { Typography } from '@mui/material';
import { ActivityEventType } from 'generated-sources';
import OwnerWithRole, {
  OwnerWithRoleProps,
} from 'components/Activity/ActivityResults/ActivityResultByDate/ActivityItem/ActivityFields/OwnerActivityField/OwnerWithRole/OwnerWithRole';
import * as S from './ActivityFieldHeaderStyles';

interface ActivityFieldHeaderProps extends OwnerWithRoleProps {
  icon: React.ReactNode;
  startText: string;
  activityName: string;
  contentEventType: 'created' | 'updated' | 'deleted';
}

const ActivityFieldHeader: React.FC<ActivityFieldHeaderProps> = ({
  icon,
  startText,
  activityName,
  contentEventType,
  ownerName,
  roleName,
}) => {
  const setStartText = (type: ActivityEventType) => {
    if (type.includes('OWNERSHIP')) return 'Owner';

    return '';
  };

  return (
    <S.FieldHeader container>
      {icon}
      {startText && (
        <Typography variant="subtitle1" color="texts.info">
          {startText}
        </Typography>
      )}
      <Typography variant="h4">
        {startText === 'Owner' ? (
          <>
            <OwnerWithRole ownerName={ownerName} roleName={roleName} />
            {activityName}
          </>
        ) : (
          activityName
        )}
      </Typography>
      <Typography variant="subtitle1" color="texts.info">
        was
      </Typography>
      <Typography variant="h4">{contentEventType}</Typography>
    </S.FieldHeader>
  );
};
export default ActivityFieldHeader;
