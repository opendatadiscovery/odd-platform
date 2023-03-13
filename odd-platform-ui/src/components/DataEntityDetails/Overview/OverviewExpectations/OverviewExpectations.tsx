import React from 'react';
import type { DataQualityTestExpectation, LinkedUrl } from 'generated-sources';
import { Grid, Typography } from '@mui/material';
import { AppButton } from 'components/shared';
import { DropdownIcon } from 'components/shared/Icons';
import * as S from './OverviewExpectationsStyles';

interface OverviewExpectationsProps {
  parameters: DataQualityTestExpectation | undefined;
  linkedUrlList: LinkedUrl[] | undefined;
}

const OverviewExpectations: React.FC<OverviewExpectationsProps> = ({
  parameters,
  linkedUrlList,
}) => {
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);
  const stringifyParams = JSON.stringify(parameters, null, 2);
  const isExpandable = stringifyParams.length > 430;

  return (
    <Grid container flexDirection='column' alignItems='flex-start'>
      <Typography variant='h4'>Parameters</Typography>
      <S.Params variant='body1' $isOpened={isExpanded} $isExpandable={isExpandable}>
        {stringifyParams}
      </S.Params>
      {isExpandable && (
        <AppButton
          size='medium'
          color='tertiary'
          sx={{ mt: 1.25 }}
          onClick={() => setIsExpanded(!isExpanded)}
          endIcon={<DropdownIcon transform={isExpanded ? 'rotate(180)' : 'rotate(0)'} />}
        >
          {isExpanded ? 'Hide' : `Show All`}
        </AppButton>
      )}
      {linkedUrlList && linkedUrlList?.length > 0 && (
        <>
          <S.Divider />
          <Typography variant='h4'>Links</Typography>
          <Grid container flexDirection='column'>
            {linkedUrlList?.map(({ name, url }) => (
              <AppButton
                to={url}
                key={url}
                sx={{ my: 0.25 }}
                size='medium'
                color='tertiary'
                linkTarget='_blank'
                truncate
              >
                {name}
              </AppButton>
            ))}
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default OverviewExpectations;
