import React from 'react';
import { Box, Collapse, Grid, Typography } from '@mui/material';
import { type DataEntityRef, Permission } from 'generated-sources';
import { Button } from 'components/shared/elements';
import { AddIcon } from 'components/shared/icons';
import { WithPermissions } from 'components/shared/contexts';
import AddDataEntityToGroupForm from './AddDataEntityToGroupForm/AddDataEntityToGroupForm';
import GroupItem from './GroupItem/GroupItem';
import { GroupsCaptionContainer } from './OverviewGroupsStyles';

interface OverviewTermsProps {
  dataEntityId: number;
  dataEntityGroups?: DataEntityRef[];
}

const OverviewGroups: React.FC<OverviewTermsProps> = ({
  dataEntityGroups,
  dataEntityId,
}) => {
  const visibleLimit = 10;
  const [viewAll, setViewAll] = React.useState(false);

  return (
    <div>
      <GroupsCaptionContainer>
        <Typography variant='h4'>Data entity groups</Typography>
        <WithPermissions permissionTo={Permission.DATA_ENTITY_ADD_TO_GROUP}>
          <AddDataEntityToGroupForm
            dataEntityId={dataEntityId}
            btnCreateEl={
              <Button
                text='Add to group'
                buttonType='secondary-m'
                startIcon={<AddIcon />}
              />
            }
          />
        </WithPermissions>
      </GroupsCaptionContainer>
      {dataEntityGroups?.length ? (
        <Box sx={{ mx: -0.5, my: 0 }}>
          {dataEntityGroups
            .slice(0, visibleLimit)
            .sort()
            .map(group => (
              <GroupItem key={group.id} group={group} dataEntityId={dataEntityId} />
            ))}
          {dataEntityGroups?.length > visibleLimit && (
            <>
              <Collapse in={viewAll} timeout='auto' unmountOnExit>
                {viewAll &&
                  dataEntityGroups
                    ?.slice(visibleLimit)
                    .sort()
                    .map(group => (
                      <GroupItem
                        key={group.id}
                        group={group}
                        dataEntityId={dataEntityId}
                      />
                    ))}
              </Collapse>
              <Button
                text={viewAll ? 'Hide' : `View All (${dataEntityGroups?.length})`}
                buttonType='tertiary-m'
                sx={{ display: 'flex', ml: 0.5, mt: 1.25 }}
                onClick={() => setViewAll(!viewAll)}
              />
            </>
          )}
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
          <WithPermissions permissionTo={Permission.DATA_ENTITY_ADD_TO_GROUP}>
            <AddDataEntityToGroupForm
              dataEntityId={dataEntityId}
              btnCreateEl={<Button text='Add to group' buttonType='tertiary-sm' />}
            />
          </WithPermissions>
        </Grid>
      )}
    </div>
  );
};

export default OverviewGroups;
