import React from 'react';
import { Group } from '@visx/group';
import { Grid } from '@mui/material';
import { type DataEntityLineageById } from 'redux/interfaces';
import { localPoint } from '@visx/event';
import { useQueryParams } from 'lib/hooks';
import { defaultLineageQuery, initialTransformMatrix } from '../lineageLib/constants';
import type { LineageQueryParams, Zoom } from '../lineageLib/interfaces';
import * as S from './ZoomableLineageStyles';
import LineageControls from './LineageControls/LineageControls';
import LineageGraph from './LineageGraph/LineageGraph';

interface ZoomableLineageProps {
  data: DataEntityLineageById;
  zoom: Zoom;
  width: number;
  height: number;
  dataEntityId: number;
}
const ZoomableLineage = React.memo<ZoomableLineageProps>(
  ({ data, zoom, width, height, dataEntityId }) => {
    const handleCenterRoot = React.useCallback(() => {
      zoom.setTransformMatrix(initialTransformMatrix);
    }, [width, height]);

    const { setQueryParams } = useQueryParams<LineageQueryParams>(defaultLineageQuery);

    const handleOnMouseLeave = () => {
      if (zoom.isDragging) zoom.dragEnd();
      setQueryParams(prev => ({ ...prev, t: JSON.stringify(zoom.transformMatrix) }));
    };

    const handleOnDoubleClick = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      const point = localPoint(e) || { x: 0, y: 0 };
      zoom.scale({ scaleX: 2, scaleY: 2, point });
    };

    return (
      <Grid container position='relative'>
        <LineageControls
          rootNodeId={data?.rootNode.id}
          handleCenterRoot={handleCenterRoot}
        />

        <S.Container
          $isDragging={zoom.isDragging}
          ref={zoom.containerRef}
          width={width}
          height={height}
          onMouseDown={zoom.dragStart}
          onMouseMove={zoom.dragMove}
          onMouseUp={zoom.dragEnd}
          onMouseLeave={handleOnMouseLeave}
          onDoubleClick={handleOnDoubleClick}
        >
          <rect width={width} height={height} fill='#F4F5F7' />
          <Group transform={zoom.toString()}>
            <LineageGraph data={data} dataEntityId={dataEntityId} />
          </Group>
        </S.Container>
      </Grid>
    );
  }
);

export default ZoomableLineage;
