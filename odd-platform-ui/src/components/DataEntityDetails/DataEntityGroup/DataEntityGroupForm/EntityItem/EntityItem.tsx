import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Button, EntityClassItem } from 'components/shared/elements';
import { type DataEntityRef } from 'generated-sources';
import { DeleteIcon } from 'components/shared/icons';
import { Container } from './EntityItemStyles';

interface TagItemProps {
  onRemoveClick?: () => void;
  entity: DataEntityRef;
}

const EntityItem: React.FC<TagItemProps> = ({ onRemoveClick = () => {}, entity }) => (
  <Container container>
    <Grid container flexWrap='nowrap' sx={{ width: 'calc(100% - 24px)' }}>
      <Typography variant='body1' sx={{ mr: 1 }} noWrap>
        {entity.internalName || entity.externalName}
      </Typography>
      {entity.entityClasses?.map(entityClass => (
        <EntityClassItem
          sx={{ mr: 0.5 }}
          key={entityClass.id}
          entityClassName={entityClass.name}
        />
      ))}
    </Grid>
    <Button
      buttonType='tertiary-m'
      icon={<DeleteIcon />}
      sx={{ ml: 0.5 }}
      onClick={onRemoveClick}
    />
  </Container>
);

export default EntityItem;
