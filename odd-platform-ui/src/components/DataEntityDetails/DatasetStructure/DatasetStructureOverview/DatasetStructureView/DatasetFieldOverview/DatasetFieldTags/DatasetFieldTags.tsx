import React from 'react';
import { Collapse, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Permission } from 'generated-sources';
import type { DataSetField, Tag } from 'generated-sources';
import { Button, TagItem } from 'components/shared/elements';
import { WithPermissions } from 'components/shared/contexts';
import { TagsContainer } from './DatasetFieldTagsStyles';
import TagsEditForm from './TagsEditForm/TagsEditForm';
import * as S from '../DatasetFieldOverview.styles';

function compareTags(a: Tag, b: Tag) {
  // compare by importance and alphabet
  if (a.important === b.important) {
    return a.name.localeCompare(b.name);
  }
  return a.important ? -1 : 1;
}

interface DatasetFieldTagsProps {
  tags: DataSetField['tags'];
  datasetFieldId: number;
  isStatusDeleted: boolean;
}

const DatasetFieldTags: React.FC<DatasetFieldTagsProps> = ({
  tags,
  datasetFieldId,
  isStatusDeleted,
}) => {
  const { t } = useTranslation();
  const visibleLimit = 20;
  const [viewAll, setViewAll] = React.useState(false);

  return (
    <S.SectionContainer container>
      <Grid container justifyContent='space-between'>
        <Typography variant='h5' color='texts.hint'>
          {t('TAGS')}
        </Typography>
        <WithPermissions permissionTo={Permission.DATASET_FIELD_TAGS_UPDATE}>
          {!isStatusDeleted && (
            <TagsEditForm
              datasetFieldId={datasetFieldId}
              btnEditEl={
                <Button
                  text={tags?.length ? t('Edit tags') : t('Add tags')}
                  buttonType='secondary-m'
                  sx={{ mr: 1 }}
                />
              }
            />
          )}
        </WithPermissions>
      </Grid>
      <Grid container flexDirection='column' alignItems='flex-start'>
        {tags?.length ? (
          <TagsContainer sx={{ mx: -0.5, my: 0 }}>
            {tags
              .slice(0, visibleLimit)
              .sort(compareTags)
              .map(tag => (
                <TagItem
                  key={tag.id}
                  systemTag={tag.external}
                  label={tag.name}
                  important={tag.important}
                  sx={{ m: 0.5 }}
                />
              ))}
            {tags?.length > visibleLimit ? (
              <Grid container flexDirection='column' alignItems='flex-start'>
                <Collapse in={viewAll} timeout='auto' unmountOnExit>
                  {viewAll
                    ? tags
                        ?.slice(visibleLimit)
                        .sort(compareTags)
                        .map(tag => (
                          <TagItem
                            systemTag={tag.external}
                            key={tag.id}
                            label={tag.name}
                            important={tag.important}
                            sx={{ m: 0.5 }}
                          />
                        ))
                    : null}
                </Collapse>
                <Button
                  text={viewAll ? t('Hide') : `${t('View All')} (${tags?.length})`}
                  buttonType='tertiary-m'
                  sx={{ ml: 0.5, mt: 1.25 }}
                  onClick={() => setViewAll(!viewAll)}
                />
              </Grid>
            ) : null}
          </TagsContainer>
        ) : (
          <Grid container flexDirection='column' alignItems='flex-start'>
            <Typography mt={1} variant='subtitle1'>
              {t('Tags are not created yet')}
            </Typography>
          </Grid>
        )}
      </Grid>
    </S.SectionContainer>
  );
};

export default DatasetFieldTags;
