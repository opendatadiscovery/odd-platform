import React from 'react';
import TruncateMarkup from 'react-truncate-markup';
import type { DataEntityRef, LinkedUrl } from 'generated-sources';
import AppButton from 'components/shared/AppButton/AppButton';
import { useAppPaths } from 'lib/hooks';
import TruncatedCellMenu from './TruncatedCellMenu/TruncatedCellMenu';
import * as S from './TruncatedCellStyles';

interface TruncatedCellProps {
  externalEntityId: number;
  dataList: DataEntityRef[] | string[] | LinkedUrl[] | undefined;
}

const isLinkedUrl = (val: LinkedUrl | DataEntityRef): val is LinkedUrl =>
  !('id' in val) && 'url' in val;

export type Values = {
  key: string;
  linkTo: string;
  linkContent: string | undefined;
};

const TruncatedCell: React.FC<TruncatedCellProps> = ({ dataList, externalEntityId }) => {
  const { dataEntityOverviewPath } = useAppPaths();

  const getValues = React.useCallback(
    (item: DataEntityRef | LinkedUrl | string): Values => {
      let key = '';
      let linkTo = '';
      let linkContent: string | undefined = '';

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
    },
    []
  );

  const getTruncateMarkupAtom = (item: DataEntityRef | LinkedUrl | string) => {
    const { key, linkTo, linkContent } = getValues(item);
    const updatedLink =
      typeof item !== 'string' && 'id' in item ? linkTo : { pathname: linkTo };

    return (
      <TruncateMarkup.Atom key={key}>
        <AppButton
          onClick={e => {
            e.stopPropagation();
          }}
          to={updatedLink}
          linkTarget='_blank'
          color='primaryLight'
          size='small'
          fullWidth={linkContent ? linkContent.length > 30 : false}
        >
          <S.LinkContent noWrap>{linkContent}</S.LinkContent>
        </AppButton>
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
