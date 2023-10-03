import React from 'react';
import { Collapse, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Permission, type Tag } from 'generated-sources';
import { Button, TagItem } from 'components/shared/elements';
import { WithPermissions } from 'components/shared/contexts';
import { AddIcon, EditIcon } from 'components/shared/icons';
import { useAppSelector } from 'redux/lib/hooks';
import { getIsEntityStatusDeleted } from 'redux/selectors';
import { useAppParams } from 'lib/hooks';
import { CaptionContainer, TagsContainer } from './OverviewTagsStyles';
import TagsEditForm from './TagsEditForm/TagsEditForm';

interface OverviewTagsProps {
  tags?: Tag[];
}

const OverviewTags: React.FC<OverviewTagsProps> = ({ tags }) => {
  const { dataEntityId } = useAppParams();
  const isStatusDeleted = useAppSelector(getIsEntityStatusDeleted(dataEntityId));

  const { t } = useTranslation();
  const visibleLimit = 20;
  const [viewAll, setViewAll] = React.useState(false);

  const tagsCompare = (tag1: Tag, tag2: Tag) => {
    // compare by importance and alphabet
    if (tag1.important === tag2.important) {
      return tag1.name.localeCompare(tag2.name);
    }
    return tag1.important ? -1 : 1;
  };

  return (
    <div>
      <CaptionContainer>
        <Typography variant='h4'>{t('Tags')}</Typography>
        <WithPermissions permissionTo={Permission.DATA_ENTITY_TAGS_UPDATE}>
          {!isStatusDeleted && (
            <TagsEditForm
              btnEditEl={
                <Button
                  text={tags?.length ? t('Edit tags') : t('Add tags')}
                  buttonType='secondary-m'
                  startIcon={tags?.length ? <EditIcon /> : <AddIcon />}
                />
              }
            />
          )}
        </WithPermissions>
      </CaptionContainer>
      {tags?.length ? (
        <TagsContainer sx={{ mx: -0.5, my: 0 }}>
          {tags
            .slice(0, visibleLimit)
            .sort(tagsCompare)
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
                      .sort(tagsCompare)
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
        <Grid
          item
          xs={12}
          container
          alignItems='center'
          justifyContent='flex-start'
          wrap='nowrap'
        >
          <Typography variant='subtitle2'>{t('Not created')}.</Typography>
          <WithPermissions permissionTo={Permission.DATA_ENTITY_TAGS_UPDATE}>
            {!isStatusDeleted && (
              <TagsEditForm
                btnEditEl={<Button text={t('Add tags')} buttonType='tertiary-sm' />}
              />
            )}
          </WithPermissions>
        </Grid>
      )}
    </div>
  );
};

export default OverviewTags;
