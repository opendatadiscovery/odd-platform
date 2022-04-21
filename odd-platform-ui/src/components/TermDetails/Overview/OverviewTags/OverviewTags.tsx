import React from 'react';
import { Box, Collapse, Grid, Typography } from '@mui/material';
import { Tag } from 'generated-sources';
import TagItem from 'components/shared/TagItem/TagItem';
import EditIcon from 'components/shared/Icons/EditIcon';
import AddIcon from 'components/shared/Icons/AddIcon';
import TagsEditContainer from 'components/TermDetails/Overview/OverviewTags/TagsEditForm/TagsEditFormContainer';
import AppButton from 'components/shared/AppButton/AppButton';
import { CaptionContainer } from './OverviewTagsStyles';

interface OverviewTagsProps {
  termId: number;
  tags?: Tag[];
}

const OverviewTags: React.FC<OverviewTagsProps> = ({ tags, termId }) => {
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
        <Typography variant="h3">Tags</Typography>
        <TagsEditContainer
          termId={termId}
          btnEditEl={
            <AppButton
              size="medium"
              color="primaryLight"
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
              <Collapse in={viewAll} timeout="auto" unmountOnExit>
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
                size="small"
                color="tertiary"
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
          alignItems="center"
          justifyContent="flex-start"
          wrap="nowrap"
        >
          <Typography variant="subtitle2">Not created.</Typography>
          <TagsEditContainer
            termId={termId}
            btnEditEl={
              <AppButton size="small" color="tertiary" onClick={() => {}}>
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
