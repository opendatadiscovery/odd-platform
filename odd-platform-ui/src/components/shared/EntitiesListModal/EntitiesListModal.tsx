import React from 'react';
import { Typography } from '@mui/material';
import { DataEntityRef } from 'generated-sources';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import { Link } from 'react-router-dom';
import { dataEntityDetailsPath } from 'lib/paths';
import EntityClassItem from 'components/shared/EntityClassItem/EntityClassItem';
import * as S from './EntitiesListModalStyles';

type LabelForTypes =
  | 'Entities'
  | 'Upper groups'
  | 'Sources'
  | 'Targets'
  | 'Inputs'
  | 'Outputs';

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
  const listItem = (item: DataEntityRef) => (
    <Link to={dataEntityDetailsPath(item.id)}>
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
    <Typography variant="h4">{`${labelFor} for ${dataEntityName}`}</Typography>
  );

  const modalContent = () => (
    <div>{entities?.map(entity => listItem(entity))}</div>
  );

  return (
    <DialogWrapper
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(openBtnEl, { onClick: handleOpen })
      }
      title={modalTitle}
      renderContent={modalContent}
      maxWidth="md"
    />
  );
};

export default EntitiesListModal;
