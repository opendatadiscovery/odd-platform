import type { FC } from 'react';
import React from 'react';
import { ChevronIcon } from 'components/shared/icons';
import { Button } from 'components/shared/elements';
import { useCollapse } from 'lib/hooks';
import type { TermRef } from 'generated-sources';
import InternalDescription from './InternalDescription/InternalDescription';
import * as S from './OverviewDescription.styles';
import ExternalDescription from './ExternalDescription/ExternalDescription';

interface InternalDescriptionProps {
  termRefs?: TermRef[];
}

const OverviewDescription: FC<InternalDescriptionProps> = ({ termRefs }) => {
  const { contentRef, containerStyle, controlsStyle, toggleCollapse, isCollapsed } =
    useCollapse({ initialMaxHeight: 304 });

  return (
    <>
      <div ref={contentRef} style={containerStyle}>
        <InternalDescription terms={termRefs} />
        <ExternalDescription />
      </div>
      <S.CollapseControls style={controlsStyle}>
        <Button
          text={isCollapsed ? 'Show hidden' : 'Hide'}
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
      </S.CollapseControls>
    </>
  );
};

export default OverviewDescription;
