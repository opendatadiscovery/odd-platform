import React from 'react';
import type { DataQualityTestExpectation, LinkedUrl } from 'generated-sources';
import { Grid, Typography } from '@mui/material';
import { Button } from 'components/shared/elements';
import { DropdownIcon } from 'components/shared/icons';
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
        <Button
          text={isExpanded ? 'Hide' : `Show All`}
          buttonType='tertiary-m'
          sx={{ mt: 1.25 }}
          onClick={() => setIsExpanded(!isExpanded)}
          endIcon={<DropdownIcon transform={isExpanded ? 'rotate(180)' : 'rotate(0)'} />}
        />
      )}
      {linkedUrlList && linkedUrlList?.length > 0 && (
        <>
          <S.Divider />
          <Typography variant='h4'>Links</Typography>
          <Grid container flexDirection='column'>
            {linkedUrlList?.map(({ name, url }) => (
              <Button
                text={name}
                to={url}
                key={url}
                sx={{ my: 0.25 }}
                buttonType='link-m'
                target='_blank'
              />
            ))}
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default OverviewExpectations;
