import React, { useMemo } from 'react';
import { DataQualityTestExpectation } from 'generated-sources';
import { Box } from '@mui/material';
import ObjectRender from 'components/shared/ObjectRender/ObjectRender';

type OverviewExpectationsProps = {
  data: DataQualityTestExpectation;
};

const OverviewExpectations: React.FC<OverviewExpectationsProps> = ({
  data,
}) => {
  const parsedObj = useMemo(
    () =>
      Object.entries(data).reduce((ac, [key, value]) => {
        let parsed = '';
        try {
          parsed = JSON.parse(value);
        } catch {
          parsed = value;
        }
        return { ...ac, [key]: parsed };
      }, {}),
    [data]
  );

  return (
    <Box>
      <ObjectRender input={parsedObj} />
    </Box>
  );
};

export default OverviewExpectations;
