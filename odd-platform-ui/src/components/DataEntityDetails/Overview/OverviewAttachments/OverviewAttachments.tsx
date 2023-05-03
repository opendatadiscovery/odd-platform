import React, { type FC } from 'react';
import { Grid, Typography } from '@mui/material';
import { AppCircularProgress, AppErrorBlock, Button } from 'components/shared/elements';
import { ChevronIcon } from 'components/shared/icons';
import { useAppParams, useCollapse, useDataEntityAttachments } from 'lib/hooks';
import AttachmentsHeader from './AttachmentsHeader/AttachmentsHeader';
import * as S from './OverviewAttachments.styles';

const OverviewAttachments: FC = () => {
  const { dataEntityId } = useAppParams();
  const {
    contentRef,
    collapsibleContentProps,
    toggleCollapse,
    updateCollapse,
    isCollapsed,
    isCollapsible,
  } = useCollapse({ initialMaxHeight: 200 });

  const { data, isError, isLoading } = useDataEntityAttachments({ dataEntityId });

  const getContent = () => {
    if (isError || !data) return <AppErrorBlock />;
    if (isLoading)
      return (
        <Grid container justifyContent='center'>
          <AppCircularProgress background='transparent' size={40} />
        </Grid>
      );

    if (data.length === 0)
      return (
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
      );

    return data.map(item => <div>attachment</div>);
  };

  return (
    <>
      <Grid item container ref={contentRef} {...collapsibleContentProps}>
        <Grid container>
          <AttachmentsHeader />
          {getContent()}
        </Grid>
      </Grid>
      {isCollapsible && (
        <S.CollapseFooter container>
          <Button
            text={isCollapsed ? 'Show hidden' : `Hide`}
            endIcon={
              <ChevronIcon
                width={10}
                height={5}
                transform={isCollapsed ? 'rotate(0)' : 'rotate(180)'}
              />
            }
            buttonType='service-m'
            onClick={toggleCollapse}
          />
        </S.CollapseFooter>
      )}
    </>
  );
};

export default OverviewAttachments;
