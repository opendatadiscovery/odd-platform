import React from 'react';
import { Grid, Typography } from '@mui/material';
import type { DataEntityLineageNode } from 'generated-sources';
import { DialogWrapper, AppButton, EntityClassItem } from 'components/shared';
import { Link } from 'react-router-dom';
import {
  fetchDataEntityDownstreamLineage,
  fetchDataEntityUpstreamLineage,
} from 'redux/thunks';
import { useAppDispatch } from 'redux/lib/hooks';
import { useAppPaths } from 'lib/hooks';
import type { StreamType } from 'redux/interfaces';
import {
  expandEntitiesFromDownstreamGroup,
  expandEntitiesFromUpstreamGroup,
} from 'redux/slices/dataEntityLineage/dataEntityLineage.slice';
import LineageContext from '../../../../../lineageLib/LineageContext/LineageContext';
import * as S from './GroupedEntitiesListModalStyles';

interface GroupedEntitiesListModalProps {
  dataEntityName: string | undefined;
  entities: DataEntityLineageNode[];
  openBtnEl: JSX.Element;
  streamType: StreamType;
  rootNodeId: number;
}

const GroupedEntitiesListModal: React.FC<GroupedEntitiesListModalProps> = ({
  dataEntityName,
  entities,
  openBtnEl,
  streamType,
  rootNodeId,
}) => {
  const dispatch = useAppDispatch();
  const { dataEntityDetailsPath } = useAppPaths();
  const { expandGroups } = React.useContext(LineageContext);

  const [isLoadMoreClicked, setIsLoadMoreClicked] = React.useState(false);

  const handleLoadMore =
    (dataEntityId: number) => (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      const params = { dataEntityId, lineageDepth: 1, rootNodeId, expandGroups };
      if (streamType === 'downstream') {
        dispatch(fetchDataEntityDownstreamLineage(params));
      }

      if (streamType === 'upstream') {
        dispatch(fetchDataEntityUpstreamLineage(params));
      }

      setIsLoadMoreClicked(true);
    };

  const idsToExclude = React.useMemo(() => entities.map(entity => entity.id), [entities]);

  const handleExpandButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (streamType === 'downstream') {
      dispatch(expandEntitiesFromDownstreamGroup({ rootNodeId, idsToExclude }));
    } else {
      dispatch(expandEntitiesFromUpstreamGroup({ rootNodeId, idsToExclude }));
    }

    setIsLoadMoreClicked(true);
  };

  const listItem = (item: DataEntityLineageNode) => (
    <Link to={dataEntityDetailsPath(item.id)}>
      <S.ListItemContainer container>
        <Grid maxWidth='370px'>
          <Typography noWrap title={item.internalName || item.externalName}>
            {item.internalName || item.externalName}
          </Typography>
        </Grid>
        <Grid flex='auto' wrap='nowrap' sx={{ ml: 1 }}>
          {item.entityClasses?.map(entityClass => (
            <EntityClassItem
              sx={{ mr: 0.5 }}
              key={entityClass.id}
              entityClassName={entityClass.name}
            />
          ))}
        </Grid>
        <AppButton color='primaryLight' size='medium' onClick={handleLoadMore(item.id)}>
          Load more
        </AppButton>
      </S.ListItemContainer>
    </Link>
  );

  const modalTitle = (
    <Grid container justifyContent='space-between' alignItems='center'>
      <Typography variant='h4'>{`Entities list of ${dataEntityName}`}</Typography>
      <AppButton
        sx={{ mr: 1 }}
        color='primaryLight'
        size='medium'
        onClick={handleExpandButton}
      >
        Show all entities
      </AppButton>
    </Grid>
  );

  const sortByName = (a: DataEntityLineageNode, b: DataEntityLineageNode) => {
    const aName = a.internalName || a.externalName || '';
    const bName = b.internalName || b.externalName || '';

    return aName.localeCompare(bName);
  };

  const modalContent = () => (
    <div>
      {[...(entities || [])].sort(sortByName).map((entity: DataEntityLineageNode) => (
        <div key={entity.id}>{listItem(entity)}</div>
      ))}
    </div>
  );

  return (
    <DialogWrapper
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(openBtnEl, {
          onClick: () => {
            handleOpen();
            setIsLoadMoreClicked(false);
          },
        })
      }
      title={modalTitle}
      renderContent={modalContent}
      maxWidth='lg'
      handleCloseSubmittedForm={isLoadMoreClicked}
    />
  );
};

export default GroupedEntitiesListModal;
