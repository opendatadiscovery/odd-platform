import React, { type FC } from 'react';
import { Grid, Typography } from '@mui/material';
import { AppCircularProgress, AppErrorBlock } from 'components/shared/elements';
import { useAppParams, useDataEntityAttachments } from 'lib/hooks';
import AttachmentsList from './AttachmentsList/AttachmentsList';
import AttachmentsHeader from './AttachmentsHeader/AttachmentsHeader';

const OverviewAttachments: FC = () => {
  const { dataEntityId } = useAppParams();

  const { data, isError, isLoading } = useDataEntityAttachments({ dataEntityId });

  return (
    <Grid item container>
      <Grid container>
        <AttachmentsHeader />
        {isLoading && (
          <Grid container justifyContent='center'>
            <AppCircularProgress background='transparent' size={40} />
          </Grid>
        )}
        {data && data.length === 0 && (
          <Grid
            container
            alignItems='center'
            justifyContent='flex-start'
            wrap='nowrap'
            mt={1}
          >
            <Typography variant='subtitle1'>
              No attachments yet. You can add attachments via the button on the right
            </Typography>
          </Grid>
        )}
        {isError && <AppErrorBlock />}
        {data && <AttachmentsList data={data} />}
      </Grid>
    </Grid>
  );
};

export default OverviewAttachments;
