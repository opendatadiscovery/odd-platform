import React from 'react';
import { Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { DataEntityRef } from 'generated-sources';
import EntityClassItem from 'components/shared/elements/EntityClassItem/EntityClassItem';
import DialogWrapper from 'components/shared/elements/DialogWrapper/DialogWrapper';
import * as S from 'components/shared/elements/EntitiesListModal/EntitiesListModalStyles';
import { dataEntityDetailsPath } from 'routes';

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
  const { t } = useTranslation();

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
    <Typography variant='h4'>{`${labelFor} ${t('for')} ${dataEntityName}`}</Typography>
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
