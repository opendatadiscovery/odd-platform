import React from 'react';
import { linkHorizontal } from 'd3-shape';
import type { DefaultLinkObject } from 'd3';
import type { TreeLinkDatum } from 'redux/interfaces';
import { applyOpacity } from 'components/shared/AppGraph/helpers/lineageHelpers';
import * as S from './AppGraphCrossLinkStyles';

interface AppGraphLinkProps {
  linkData: TreeLinkDatum;
  nodeSize: {
    x: number;
    y: number;
    mx: number;
    my: number;
  };
  reverse?: boolean;
  enableLegacyTransitions: boolean;
  transitionDuration: number;
  replacedCrossLinks: TreeLinkDatum[];
}

const AppGraphCrossLink: React.FC<AppGraphLinkProps> = ({
  linkData,
  nodeSize,
  reverse,
  enableLegacyTransitions,
  transitionDuration,
  replacedCrossLinks,
}) => {
  let linkRef: SVGPathElement;
  const { source, target } = linkData;

  const [isReplacedLink, setIsReplacedLink] = React.useState<boolean>(false);

  const replacedCrossLink = replacedCrossLinks.find(
    ({ source: replacedSource, target: replacedTarget }) =>
      replacedSource === source && replacedTarget === target
  );

  React.useEffect(() => {
    if (replacedCrossLink) {
      setIsReplacedLink(true);
    }
  }, [replacedCrossLink, setIsReplacedLink]);

  const crossLinkCoords: DefaultLinkObject = {
    source: reverse
      ? [source.y + nodeSize.x, source.x + nodeSize.y / 1.5]
      : [source.y, source.x + nodeSize.y / 1.5],
    target: reverse
      ? [target.y, target.x + nodeSize.y / 1.5]
      : [target.y + nodeSize.x, target.x + nodeSize.y / 1.5],
  };

  React.useEffect(() => {
    applyOpacity(linkRef, enableLegacyTransitions, transitionDuration, 1);
  }, []);

  const drawPath = () => linkHorizontal()(crossLinkCoords) || undefined;

  return (
    <S.Container>
      <defs>
        <marker
          id='crossHead'
          orient='auto-start-reverse'
          markerWidth='13'
          markerHeight='14'
          refX='11'
          refY='5.6'
        >
          <S.Arrow d='M 0 0 12 6 0 12 3 6' />
        </marker>
      </defs>
      <S.Path
        ref={l => {
          if (l) linkRef = l;
        }}
        style={{ opacity: 0 }}
        d={drawPath()}
        data-source-id={source.id}
        data-target-id={target.id}
        markerStart={reverse || isReplacedLink ? 'url(#crossHead)' : ''}
        markerEnd={reverse || isReplacedLink ? '' : 'url(#crossHead)'}
      />
    </S.Container>
  );
};

export default AppGraphCrossLink;
