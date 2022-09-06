import React from 'react';
import { DataQualityTestExpectation } from 'generated-sources';
import { Grid, Typography } from '@mui/material';
import AppButton from 'components/shared/AppButton/AppButton';
import DropdownIcon from 'components/shared/Icons/DropdownIcon';
import * as S from './OverviewExpectationsStyles';

interface OverviewExpectationsProps {
  parameters: DataQualityTestExpectation | undefined;
  linkedUrlList: string[] | undefined;
}

const OverviewExpectations: React.FC<OverviewExpectationsProps> = ({
  parameters,
  linkedUrlList,
}) => {
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);
  const jsonParams = JSON.stringify(parameters, null, 2);
  const isExpandable = jsonParams.length > 430;

  return (
    <Grid container flexDirection="column">
      <Typography variant="h4">Parameters</Typography>
      <S.Params
        variant="body1"
        $isOpened={isExpanded}
        $isExpandable={isExpandable}
      >
        {jsonParams}
      </S.Params>
      {isExpandable && (
        <AppButton
          size="medium"
          color="tertiary"
          sx={{ mt: 1.25 }}
          onClick={() => setIsExpanded(!isExpanded)}
          endIcon={
            <DropdownIcon
              transform={isExpanded ? 'rotate(180)' : 'rotate(0)'}
            />
          }
        >
          {isExpanded ? 'Hide' : `Show All`}
        </AppButton>
      )}
    </Grid>
  );
};

export default OverviewExpectations;
