import React from 'react';
import {
  ActivityCreatedIcon,
  ActivityUpdatedIcon,
  ActivityDeletedIcon,
} from 'components/shared/Icons';
import { type CRUDType } from 'lib/interfaces';

const useSetActivityHeaderIcon = (eventType: CRUDType | string) => {
  const [icon, setHeaderIcon] = React.useState<JSX.Element | null>(null);

  React.useEffect(() => {
    if (eventType === 'created' || eventType === 'added') {
      setHeaderIcon(<ActivityCreatedIcon />);
    }
    if (eventType === 'updated') {
      setHeaderIcon(<ActivityUpdatedIcon />);
    }
    if (eventType === 'deleted') {
      setHeaderIcon(<ActivityDeletedIcon />);
    }
  }, [eventType]);

  return { icon };
};

export default useSetActivityHeaderIcon;
