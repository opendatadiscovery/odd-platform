import React from 'react';
import { Grid, Typography } from '@mui/material';
import { AddIcon, ChevronIcon } from 'components/shared/icons';
import { Button } from 'components/shared/elements';
import {
  getDataEntityCustomMetadataList,
  getDataEntityPredefinedMetadataList,
} from 'redux/selectors';
import { useAppParams, useCollapse } from 'lib/hooks';
import { useAppSelector } from 'redux/lib/hooks';
import { WithPermissions } from 'components/shared/contexts';
import { Permission } from 'generated-sources';
import MetadataCreateForm from '../../Metadata/MetadataCreateForm/MetadataCreateForm';
import MetadataItem from './MetadataItem/MetadataItem';
import * as S from './OverviewMetadataStyles';

const OverviewMetadata: React.FC = () => {
  const { dataEntityId } = useAppParams();
  const {
    contentRef,
    collapsibleContentProps,
    toggleCollapse,
    updateCollapse,
    isCollapsed,
    isCollapsible,
  } = useCollapse({ initialMaxHeight: 200 });

  const predefinedMetadata = useAppSelector(
    getDataEntityPredefinedMetadataList(dataEntityId)
  );
  const customMetadata = useAppSelector(getDataEntityCustomMetadataList(dataEntityId));

  return (
    <>
      <div ref={contentRef} {...collapsibleContentProps}>
        <Grid item container>
          <Grid container>
            <Grid item xs={12}>
              <S.SubtitleContainer>
                <Typography variant='h2' sx={{}}>
                  Metadata
                </Typography>
                <WithPermissions
                  permissionTo={Permission.DATA_ENTITY_CUSTOM_METADATA_CREATE}
                >
                  <MetadataCreateForm
                    dataEntityId={dataEntityId}
                    updateCollapse={updateCollapse}
                    btnCreateEl={
                      <Button
                        text='Add metadata'
                        data-qa='add_metadata'
                        buttonType='secondary-lg'
                        startIcon={<AddIcon />}
                      />
                    }
                  />
                </WithPermissions>
              </S.SubtitleContainer>
            </Grid>
            {customMetadata.length ? (
              customMetadata.map(item => (
                <MetadataItem
                  dataEntityId={dataEntityId}
                  metadataItem={item}
                  key={item.field.id}
                  updateCollapse={updateCollapse}
                />
              ))
            ) : (
              <Grid
                item
                xs={12}
                container
                alignItems='center'
                justifyContent='flex-start'
                wrap='nowrap'
              >
                <Typography variant='subtitle2'>Not created.</Typography>
                <WithPermissions
                  permissionTo={Permission.DATA_ENTITY_CUSTOM_METADATA_CREATE}
                >
                  <MetadataCreateForm
                    dataEntityId={dataEntityId}
                    updateCollapse={updateCollapse}
                    btnCreateEl={
                      <Button
                        text='Add Metadata'
                        sx={{ ml: 0.5 }}
                        buttonType='tertiary-sm'
                      />
                    }
                  />
                </WithPermissions>
              </Grid>
            )}
          </Grid>
        </Grid>
        {predefinedMetadata.length > 0 && (
          <S.PredefinedContainer item container>
            <Grid container>
              {predefinedMetadata.map(item => (
                <MetadataItem
                  dataEntityId={dataEntityId}
                  metadataItem={item}
                  key={item.field.id}
                  updateCollapse={updateCollapse}
                />
              ))}
            </Grid>
          </S.PredefinedContainer>
        )}
      </div>
      {isCollapsible && (
        <Grid container>
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
        </Grid>
      )}
    </>
  );
};

export default OverviewMetadata;
