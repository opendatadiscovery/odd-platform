import React from 'react';
import { Grid, Typography } from '@mui/material';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import { DataEntityRef } from 'generated-sources';
import EntityClassItem from 'components/shared/EntityClassItem/EntityClassItem';
import DeleteIcon from 'components/shared/Icons/DeleteIcon';
import { Container } from './EntityItemStyles';

interface TagItemProps {
  onRemoveClick?: () => void;
  entity: DataEntityRef;
}

const EntityItem: React.FC<TagItemProps> = ({
  onRemoveClick = () => {},
  entity,
}) => (
  <Container container>
    <Grid container>
      <Typography variant="body1" sx={{ mr: 1 }}>
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
      size="small"
      color="tertiary"
      icon={<DeleteIcon />}
      sx={{ ml: 0.5 }}
      onClick={onRemoveClick}
    />
  </Container>
);

export default EntityItem;
