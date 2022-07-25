import React, { MouseEvent } from 'react';
import TruncateMarkup from 'react-truncate-markup';
import { Link } from 'react-router-dom';
import { DataEntityRef } from 'generated-sources';
import AppButton from 'components/shared/AppButton/AppButton';
import { useAppPaths } from 'lib/hooks';
import TruncatedCellMenu from './TruncatedCellMenu/TruncatedCellMenu';
import * as S from './TruncatedCellStyles';

interface TruncatedCellProps {
  externalEntityId: number;
  dataList: DataEntityRef[] | string[] | undefined;
}

const TruncatedCell: React.FC<TruncatedCellProps> = ({
  dataList,
  externalEntityId,
}) => {
  const { dataEntityDetailsPath } = useAppPaths();

  const getTruncateMarkupAtom = (item: DataEntityRef | string) => {
    const key = typeof item === 'string' ? item : item.id;
    const linkTo =
      typeof item === 'string' ? item : dataEntityDetailsPath(item.id);
    const linkContent =
      typeof item === 'string'
        ? item
        : item.internalName || item.externalName;
    return (
      <TruncateMarkup.Atom key={key}>
        <Link
          to={linkTo}
          target="_blank"
          onClick={(e: MouseEvent) => e.stopPropagation()}
        >
          <AppButton
            color="primaryLight"
            size="small"
            fullWidth={linkContent ? linkContent.length > 30 : false}
          >
            <S.LinkContent noWrap>{linkContent}</S.LinkContent>
          </AppButton>
        </Link>
      </TruncateMarkup.Atom>
    );
  };

  return (
    <TruncateMarkup
      lines={2}
      ellipsis={
        <TruncatedCellMenu dataList={dataList} menuId={externalEntityId} />
      }
    >
      <S.TruncatedList>
        {dataList?.map(getTruncateMarkupAtom)}
      </S.TruncatedList>
    </TruncateMarkup>
  );
};

export default TruncatedCell;
