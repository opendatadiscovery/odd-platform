import type { FC, ReactElement, CSSProperties } from 'react';
import React from 'react';
import { useCollapse } from 'lib/hooks';
import { ChevronIcon } from 'components/shared/icons';
import Button from 'components/shared/elements/Button/Button';
import * as S from './CollapsibleInfoContainer.styles';

interface CollapsibleInfoContainerProps {
  initialMaxHeight?: number;
  actions?: ReactElement;
  content: ReactElement;
  style?: CSSProperties;
}

const CollapsibleInfoContainer: FC<CollapsibleInfoContainerProps> = ({
  initialMaxHeight = 60,
  actions,
  content,
  style,
}) => {
  const { contentRef, containerStyle, toggleCollapse, isCollapsed, controlsStyle } =
    useCollapse({ initialMaxHeight });

  return (
    <S.Container style={style}>
      <S.ContentWrapper ref={contentRef} style={containerStyle}>
        <S.ContentContainer>{content}</S.ContentContainer>
        <S.ActionsContainer>{actions}</S.ActionsContainer>
      </S.ContentWrapper>
      <div style={controlsStyle}>
        <Button
          sx={{ mt: 0.75 }}
          text={isCollapsed ? 'See all' : `Hide`}
          endIcon={
            <ChevronIcon
              width={10}
              height={5}
              transform={isCollapsed ? 'rotate(0)' : 'rotate(180)'}
            />
          }
          buttonType='link-m'
          onClick={toggleCollapse}
        />
      </div>
    </S.Container>
  );
};

export default CollapsibleInfoContainer;
