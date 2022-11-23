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

  const [isLoadMoreClicked, setIsLoadMoreClicked] = React.useState(false);

  const loadMoreButtonHandler = (dataEntityId: number) => {
    const params = { dataEntityId, lineageDepth: 1, rootNodeId };
    if (streamType === 'downstream') {
      dispatch(fetchDataEntityDownstreamLineage(params));
    }

    if (streamType === 'upstream') {
      dispatch(fetchDataEntityUpstreamLineage(params));
    }
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
        <AppButton
          color='primaryLight'
          size='medium'
          onClick={e => {
            e.preventDefault();
            loadMoreButtonHandler(item.id);
            setIsLoadMoreClicked(true);
          }}
        >
          Load more
        </AppButton>
      </S.ListItemContainer>
    </Link>
  );

  const modalTitle = (
    <Typography variant='h4'>{`Entities list of ${dataEntityName}`}</Typography>
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
      maxWidth='md'
      handleCloseSubmittedForm={isLoadMoreClicked}
    />
  );
};

export default GroupedEntitiesListModal;
