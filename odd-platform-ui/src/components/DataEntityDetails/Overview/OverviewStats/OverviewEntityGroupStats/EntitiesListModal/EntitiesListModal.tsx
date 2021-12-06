import React from 'react';
import { Typography } from '@mui/material';
import { DataEntityRef } from 'generated-sources';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import { Link } from 'react-router-dom';
import { dataEntityDetailsPath } from 'lib/paths';
import EntityTypeItem from 'components/shared/EntityTypeItem/EntityTypeItem';
import * as S from './EntitiesListModalStyles';

interface EntitiesListModalProps {
  dataEntityGroupName: string;
  labelFor: 'Entities' | 'Upper groups';
  entities: DataEntityRef[] | undefined;
  openBtnEl: JSX.Element;
}

const EntitiesListModal: React.FC<EntitiesListModalProps> = ({
  dataEntityGroupName,
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
          {item.types?.map(type => (
            <EntityTypeItem
              sx={{ ml: 0.5 }}
              key={type.id}
              typeName={type.name}
            />
          ))}
        </S.ListItemTypesContainer>
      </S.ListItemContainer>
    </Link>
  );

  const modalTitle = (
    <Typography variant="h4">{`${labelFor} for ${dataEntityGroupName} group`}</Typography>
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
