import React from 'react';
import { Box, Collapse, Grid, Typography } from '@mui/material';
import { PermissionResourceType, Tag } from 'generated-sources';
import { EditIcon, AddIcon } from 'components/shared/Icons';
import { AppButton, TagItem } from 'components/shared';
import { useAppParams, usePermissions } from 'lib/hooks';
import TagsEditForm from './TagsEditForm/TagsEditForm';
import { CaptionContainer } from './OverviewTagsStyles';

interface OverviewTagsProps {
  tags?: Tag[];
}

const OverviewTags: React.FC<OverviewTagsProps> = ({ tags }) => {
  const { termId } = useAppParams();
  const { isAllowedTo: editTags } = usePermissions({
    resourceId: termId,
    resourceType: PermissionResourceType.TERM,
  });

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
        <Typography variant='h3'>Tags</Typography>
        <TagsEditForm
          btnEditEl={
            <AppButton
              disabled={!editTags}
              size='medium'
              color='primaryLight'
              onClick={() => {}}
              startIcon={tags?.length ? <EditIcon /> : <AddIcon />}
            >
              {tags?.length ? 'Edit' : 'Add'} tags
            </AppButton>
          }
        />
      </CaptionContainer>
      {tags?.length ? (
        <Box sx={{ mx: -0.5, my: 0 }}>
          {tags
            .slice(0, visibleLimit)
            .sort(tagsCompare)
            .map(tag => (
              <TagItem
                key={tag.id}
                label={tag.name}
                important={tag.important}
                sx={{ m: 0.5 }}
              />
            ))}
          {tags?.length > visibleLimit ? (
            <>
              <Collapse in={viewAll} timeout='auto' unmountOnExit>
                {viewAll
                  ? tags
                      ?.slice(visibleLimit)
                      .sort(tagsCompare)
                      .map(tag => (
                        <TagItem
                          key={tag.id}
                          label={tag.name}
                          important={tag.important}
                          sx={{ m: 0.5 }}
                        />
                      ))
                  : null}
              </Collapse>
              <AppButton
                size='small'
                color='tertiary'
                sx={{ display: 'flex', ml: 0.5, mt: 1.25 }}
                onClick={() => setViewAll(!viewAll)}
              >
                {viewAll ? 'Hide' : `View All (${tags?.length})`}
              </AppButton>
            </>
          ) : null}
        </Box>
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
          <TagsEditForm
            btnEditEl={
              <AppButton disabled={!editTags} size='small' color='tertiary'>
                Add tags
              </AppButton>
            }
          />
        </Grid>
      )}
    </div>
  );
};

export default OverviewTags;
