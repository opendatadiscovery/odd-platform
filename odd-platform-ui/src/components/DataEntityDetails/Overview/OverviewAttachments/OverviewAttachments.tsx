import React, { type FC, useState } from 'react';
import { Collapse, Grid, Typography } from '@mui/material';
import { AppCircularProgress, AppErrorBlock, Button } from 'components/shared/elements';
import { ChevronIcon } from 'components/shared/icons';
import { useAppParams, useDataEntityAttachments } from 'lib/hooks';
import type { DataEntityFile, DataEntityLink } from 'generated-sources';
import LinkAttachment from './AttachmentItem/LinkAttachment';
import AttachmentsHeader from './AttachmentsHeader/AttachmentsHeader';
import * as S from './OverviewAttachments.styles';

const OverviewAttachments: FC = () => {
  const { dataEntityId } = useAppParams();

  const { data, isError, isLoading } = useDataEntityAttachments({ dataEntityId });

  const [collapsed, setCollapsed] = useState(false);
  const visibleLimit = 9;

  const isLink = (item: DataEntityFile | DataEntityLink): item is DataEntityLink =>
    'url' in item;

  const renderItem = (item: DataEntityFile | DataEntityLink) =>
    isLink(item) ? (
      <LinkAttachment key={item.id} linkId={item.id} name={item.name} url={item.url} />
    ) : (
      <div>file</div>
    );

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

    return (
      <>
        <S.ListContainer container>
          {data.slice(0, visibleLimit).map(renderItem)}
        </S.ListContainer>
        {data.length > visibleLimit && (
          <Collapse in={collapsed} timeout='auto' unmountOnExit>
            <S.ListContainer container $multiline>
              {data.slice(visibleLimit).map(renderItem)}
            </S.ListContainer>
          </Collapse>
        )}
      </>
    );
  };

  return (
    <>
      <Grid item container>
        <Grid container>
          <AttachmentsHeader />
          {getContent()}
        </Grid>
      </Grid>
      {data && data.length > visibleLimit && (
        <S.CollapseFooter container>
          <Button
            text={collapsed ? `Hide` : 'Show hidden'}
            endIcon={
              <ChevronIcon
                width={10}
                height={5}
                transform={collapsed ? 'rotate(180)' : 'rotate(0)'}
              />
            }
            buttonType='service-m'
            onClick={() => setCollapsed(prev => !prev)}
          />
        </S.CollapseFooter>
      )}
    </>
  );
};

export default OverviewAttachments;
