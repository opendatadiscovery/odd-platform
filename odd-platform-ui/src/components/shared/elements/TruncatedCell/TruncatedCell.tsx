import React from 'react';
import TruncateMarkup from 'react-truncate-markup';
import type { DataEntityRef, LinkedUrl } from 'generated-sources';
import { useAppPaths } from 'lib/hooks';
import TruncatedCellMenu from 'components/shared/elements/TruncatedCell/TruncatedCellMenu/TruncatedCellMenu';
import * as S from 'components/shared/elements/TruncatedCell/TruncatedCellStyles';
import Button from 'components/shared/elements/Button/Button';
import type { SerializeDateToNumber } from 'redux/interfaces';

interface TruncatedCellProps {
  externalEntityId: number;
  dataList:
    | DataEntityRef[]
    | string[]
    | LinkedUrl[]
    | undefined
    | SerializeDateToNumber<DataEntityRef[]>;
}

const isLinkedUrl = (
  val: LinkedUrl | DataEntityRef | SerializeDateToNumber<DataEntityRef>
): val is LinkedUrl => !('id' in val) && 'url' in val;

export type Values = {
  key: string;
  linkTo: string;
  linkContent: string | undefined;
};

type Item = DataEntityRef | LinkedUrl | string | SerializeDateToNumber<DataEntityRef>;

const TruncatedCell: React.FC<TruncatedCellProps> = ({ dataList, externalEntityId }) => {
  const { dataEntityOverviewPath } = useAppPaths();

  const getValues = React.useCallback((item: Item): Values => {
    let key;
    let linkTo;
    let linkContent: string | undefined;

    if (typeof item === 'string') {
      key = item;
      linkTo = item;
      linkContent = item;
    } else if (isLinkedUrl(item)) {
      key = item.url;
      linkTo = item.url;
      linkContent = item.name;
    } else {
      key = `${item.id}`;
      linkTo = dataEntityOverviewPath(item.id);
      linkContent = item.internalName || item.externalName;
    }

    return { key, linkTo, linkContent };
  }, []);

  const getTruncateMarkupAtom = (item: Item) => {
    const { key, linkTo, linkContent } = getValues(item);

    return (
      <TruncateMarkup.Atom key={key}>
        <Button
          text={linkContent}
          onClick={e => {
            e.stopPropagation();
          }}
          to={linkTo}
          target='_blank'
          buttonType='secondary-sm'
          fullWidth={linkContent ? linkContent.length > 30 : false}
        />
      </TruncateMarkup.Atom>
    );
  };

  return (
    <TruncateMarkup
      lines={3}
      ellipsis={
        <TruncatedCellMenu
          dataList={dataList}
          menuId={externalEntityId}
          getValues={getValues}
        />
      }
    >
      <S.TruncatedList>{dataList?.map(getTruncateMarkupAtom)}</S.TruncatedList>
    </TruncateMarkup>
  );
};

export default TruncatedCell;
