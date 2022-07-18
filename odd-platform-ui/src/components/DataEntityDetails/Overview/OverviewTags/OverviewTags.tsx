import React from 'react';
import { Collapse, Grid, Typography } from '@mui/material';
import { Tag } from 'generated-sources';
import TagItem from 'components/shared/TagItem/TagItem';
import EditIcon from 'components/shared/Icons/EditIcon';
import AddIcon from 'components/shared/Icons/AddIcon';
import TagsEditContainer from 'components/DataEntityDetails/Overview/OverviewTags/TagsEditForm/TagsEditFormContainer';
import AppButton from 'components/shared/AppButton/AppButton';
import { CaptionContainer, TagsContainer } from './OverviewTagsStyles';

interface OverviewTagsProps {
  dataEntityId: number;
  tags?: Tag[];
}

const OverviewTags: React.FC<OverviewTagsProps> = ({
  tags,
  dataEntityId,
}) => {
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
        <Typography variant="h4">Tags</Typography>
        <TagsEditContainer
          dataEntityId={dataEntityId}
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
            <Grid container flexDirection="column" alignItems="flex-start">
              <Collapse in={viewAll} timeout="auto" unmountOnExit>
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
              <AppButton
                size="small"
                color="tertiary"
                sx={{ ml: 0.5, mt: 1.25 }}
                onClick={() => setViewAll(!viewAll)}
              >
                {viewAll ? 'Hide' : `View All (${tags?.length})`}
              </AppButton>
            </Grid>
          ) : null}
        </TagsContainer>
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
            dataEntityId={dataEntityId}
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
