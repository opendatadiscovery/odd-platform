import React from 'react';
import { Typography } from '@mui/material';
import type { DataEntityRef } from 'generated-sources';
import { Link } from 'react-router-dom';
import { useAppPaths } from 'lib/hooks';
import EntityClassItem from 'components/shared/elements/EntityClassItem/EntityClassItem';
import DialogWrapper from 'components/shared/elements/DialogWrapper/DialogWrapper';
import * as S from 'components/shared/elements/EntitiesListModal/EntitiesListModalStyles';

type LabelForTypes =
  | 'Entities'
  | 'Upper groups'
  | 'Sources'
  | 'Targets'
  | 'Inputs'
  | 'Outputs'
  | 'Datasets';

interface EntitiesListModalProps {
  dataEntityName: string | undefined;
  labelFor: LabelForTypes;
  entities: DataEntityRef[] | undefined;
  openBtnEl: JSX.Element;
}

const EntitiesListModal: React.FC<EntitiesListModalProps> = ({
  dataEntityName,
  labelFor,
  entities,
  openBtnEl,
}) => {
  const { dataEntityOverviewPath } = useAppPaths();

  const listItem = (item: DataEntityRef) => (
    <Link to={dataEntityOverviewPath(item.id)}>
      <S.ListItemContainer container>
        <Typography noWrap title={item.internalName || item.externalName}>
          {item.internalName || item.externalName}
        </Typography>
        <S.ListItemTypesContainer container>
          {item.entityClasses?.map(entityClass => (
            <EntityClassItem
              sx={{ ml: 0.5 }}
              key={entityClass.id}
              entityClassName={entityClass.name}
            />
          ))}
        </S.ListItemTypesContainer>
      </S.ListItemContainer>
    </Link>
  );

  const modalTitle = (
    <Typography variant='h4'>{`${labelFor} for ${dataEntityName}`}</Typography>
  );

  const modalContent = () => <div>{entities?.map(entity => listItem(entity))}</div>;

  return (
    <DialogWrapper
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(openBtnEl, { onClick: handleOpen })
      }
      title={modalTitle}
      renderContent={modalContent}
      maxWidth='lg'
    />
  );
};

export default EntitiesListModal;
