import React from 'react';
import { Collapse, Grid, Typography } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import { Tag } from 'generated-sources';
import TagItem from 'components/shared/TagItem/TagItem';
import EditIcon from 'components/shared/Icons/EditIcon';
import AddIcon from 'components/shared/Icons/AddIcon';
import TagsEditContainer from 'components/DataEntityDetails/Overview/OverviewTags/TagsEditForm/TagsEditFormContainer';
import AppButton2 from 'components/shared/AppButton2/AppButton2';
import { styles, StylesType } from './OverviewTagsStyles';

interface OverviewTagsProps extends StylesType {
  dataEntityId: number;
  tags?: Tag[];
}

const OverviewTags: React.FC<OverviewTagsProps> = ({
  classes,
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
      <div className={classes.captionContainer}>
        <Typography variant="h4" className={classes.caption}>
          Tags
        </Typography>
        <TagsEditContainer
          dataEntityId={dataEntityId}
          btnEditEl={
            <AppButton2
              size="medium"
              color="primaryLight"
              onClick={() => {}}
              startIcon={tags?.length ? <EditIcon /> : <AddIcon />}
            >
              {tags?.length ? 'Edit' : 'Add'} tags
            </AppButton2>
          }
        />
      </div>
      {tags?.length ? (
        <div className={classes.tagsContainer}>
          {tags
            .slice(0, visibleLimit)
            .sort(tagsCompare)
            .map(tag => (
              <TagItem
                key={tag.id}
                label={tag.name}
                important={tag.important}
                classes={{ container: classes.tagItem }}
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
                          classes={{ container: classes.tagItem }}
                        />
                      ))
                  : null}
              </Collapse>
              <AppButton2
                size="small"
                color="tertiary"
                sx={{ display: 'flex', ml: 0.5, mt: 1.25 }}
                onClick={() => setViewAll(!viewAll)}
              >
                {viewAll ? 'Hide' : `View All (${tags?.length})`}
              </AppButton2>
            </>
          ) : null}
        </div>
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
              <AppButton2 size="small" color="tertiary" onClick={() => {}}>
                Add tags
              </AppButton2>
            }
          />
        </Grid>
      )}
    </div>
  );
};

export default withStyles(styles)(OverviewTags);
