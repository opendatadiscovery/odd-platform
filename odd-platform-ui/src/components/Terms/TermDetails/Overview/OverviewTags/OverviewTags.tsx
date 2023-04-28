import React from 'react';
import { Box, Collapse, Grid, Typography } from '@mui/material';
import { Permission, type Tag } from 'generated-sources';
import { AddIcon, EditIcon } from 'components/shared/icons';
import { Button, TagItem } from 'components/shared/elements';
import { WithPermissions } from 'components/shared/contexts';
import TagsEditForm from './TagsEditForm/TagsEditForm';
import { CaptionContainer } from './OverviewTagsStyles';

interface OverviewTagsProps {
  tags?: Tag[];
}

const OverviewTags: React.FC<OverviewTagsProps> = ({ tags }) => {
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
        <WithPermissions permissionTo={Permission.TERM_TAGS_UPDATE}>
          <TagsEditForm
            btnEditEl={
              <Button
                text={tags?.length ? 'Edit tags' : 'Add tags'}
                buttonType='secondary-m'
                onClick={() => {}}
                startIcon={tags?.length ? <EditIcon /> : <AddIcon />}
              />
            }
          />
        </WithPermissions>
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
              <Button
                text={viewAll ? 'Hide' : `View All (${tags?.length})`}
                buttonType='tertiary-m'
                sx={{ display: 'flex', ml: 0.5, mt: 1.25 }}
                onClick={() => setViewAll(!viewAll)}
              />
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
          <WithPermissions permissionTo={Permission.TERM_TAGS_UPDATE}>
            <TagsEditForm
              btnEditEl={<Button text='Add tags' buttonType='tertiary-sm' />}
            />
          </WithPermissions>
        </Grid>
      )}
    </div>
  );
};

export default OverviewTags;
