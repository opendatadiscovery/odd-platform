import React from 'react';
import { Group } from '@visx/group';
import type { NodeSize } from 'components/DataEntityDetails/Lineage/HierarchyLineage/lineageLib/interfaces';
import * as S from 'components/DataEntityDetails/Lineage/HierarchyLineage/ZoomableLineage/LineageGraph/Node/HiddenDependencies/HiddenDependenciesStyles';

interface HiddenDependenciesProps {
  reverse: boolean | undefined;
  childrenCount: number | undefined;
  parentsCount: number | undefined;
  externalName: string | undefined;
  nodeSize: NodeSize;
}
const HiddenDependencies = React.memo<HiddenDependenciesProps>(
  ({ reverse, childrenCount, parentsCount, externalName, nodeSize }) => {
    const showParentChildrenCount = React.useMemo(
      () => (reverse ? Boolean(childrenCount) : Boolean(parentsCount)),
      [reverse, childrenCount, parentsCount]
    );

    const upstreamArrow = (
      <svg
        width='8'
        height='8'
        viewBox='0 0 8 8'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        x={0}
        y={1}
      >
        <path
          d='M5.2 1L1 1M1 1L1 5.2M1 1L7 7'
          stroke='#A8B0BD'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    );

    const downstreamArrow = (
      <svg
        width='8'
        height='8'
        viewBox='0 0 8 8'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        x={0}
        y={1}
      >
        <path
          d='M2.8 7L7 7M7 7L7 2.8M7 7L1 0.999999'
          stroke='#A8B0BD'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    );

    return (
      <Group left={nodeSize.content.hiddenDeps.x} top={nodeSize.content.hiddenDeps.y}>
        {showParentChildrenCount && externalName ? (
          <>
            {reverse ? downstreamArrow : upstreamArrow}
            <S.Count x={10} y={10}>
              {reverse ? `${childrenCount}` : `${parentsCount}`}
            </S.Count>
          </>
        ) : null}
      </Group>
    );
  }
);

export default HiddenDependencies;
