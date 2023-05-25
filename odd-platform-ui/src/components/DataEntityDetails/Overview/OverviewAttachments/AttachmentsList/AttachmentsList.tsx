import React, { type FC, useMemo, useRef, useState } from 'react';
import { Collapse } from '@mui/material';
import { Button } from 'components/shared/elements';
import { ChevronIcon } from 'components/shared/icons';
import type { DataEntityFile, DataEntityLink } from 'generated-sources';
import FileAttachment from '../AttachmentItem/FileAttachment';
import LinkAttachment from '../AttachmentItem/LinkAttachment';
import * as S from './AttachmentsList.styles';

interface AttachmentsListProps {
  data: Array<DataEntityFile | DataEntityLink>;
}

const AttachmentsList: FC<AttachmentsListProps> = ({ data }) => {
  const [collapsed, setCollapsed] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const visibleLimit = useMemo(() => {
    const defaultLimit = 9;

    if (listRef.current) {
      const { offsetWidth } = listRef.current;
      const calculatedLimit = offsetWidth / (96 + 16);
      return Math.floor(calculatedLimit);
    }

    return defaultLimit;
  }, [listRef.current]);

  const isLink = (item: DataEntityFile | DataEntityLink): item is DataEntityLink =>
    'url' in item;

  const renderItem = (item: DataEntityFile | DataEntityLink) =>
    isLink(item) ? (
      <LinkAttachment key={item.id} linkId={item.id} name={item.name} url={item.url} />
    ) : (
      <FileAttachment key={item.id} fileId={item.id} name={item.name} />
    );

  return (
    <>
      <S.ListContainer container ref={listRef}>
        {data.slice(0, visibleLimit).map(renderItem)}
      </S.ListContainer>
      {data.length > visibleLimit && (
        <Collapse in={collapsed} timeout='auto' unmountOnExit>
          <S.ListContainer container $multiline>
            {data.slice(visibleLimit).map(renderItem)}
          </S.ListContainer>
        </Collapse>
      )}
      {data && data.length > visibleLimit && (
        <S.CollapseFooter container>
          <Button
            text={collapsed ? `Hide` : 'Show hidden'}
            endIcon={<ChevronIcon transform={collapsed ? 'rotate(180)' : 'rotate(0)'} />}
            buttonType='service-m'
            onClick={() => setCollapsed(prev => !prev)}
          />
        </S.CollapseFooter>
      )}
    </>
  );
};

export default AttachmentsList;
