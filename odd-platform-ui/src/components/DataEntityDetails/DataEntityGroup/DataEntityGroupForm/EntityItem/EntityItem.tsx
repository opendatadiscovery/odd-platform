import React from 'react';
import { Grid, Typography } from '@mui/material';
import { AppIconButton, EntityClassItem } from 'components/shared';
import { DataEntityRef } from 'generated-sources';
import { DeleteIcon } from 'components/shared/Icons';
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
    <AppIconButton
      size='small'
      color='tertiary'
      icon={<DeleteIcon />}
      sx={{ ml: 0.5 }}
      onClick={onRemoveClick}
    />
  </Container>
);

export default EntityItem;
