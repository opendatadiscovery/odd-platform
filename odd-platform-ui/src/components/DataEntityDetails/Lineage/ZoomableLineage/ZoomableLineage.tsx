import React from 'react';
import { Group } from '@visx/group';
import { Grid, type SelectChangeEvent } from '@mui/material';
import { type DataEntityLineageById } from 'redux/interfaces';
import { localPoint } from '@visx/event';
import { type Zoom } from '../lineageLib/interfaces';
import * as S from './ZoomableLineageStyles';
import LineageControls from './LineageControls/LineageControls';
import LineageGraph from './LineageGraph/LineageGraph';

interface ZoomableLineageProps {
  data: DataEntityLineageById;
  zoom: Zoom;
  width: number;
  height: number;
  dataEntityId: number;
  lineageDepth: number;
  handleDepthChange: (e: SelectChangeEvent<unknown> | number) => void;
}
const ZoomableLineage = React.memo<ZoomableLineageProps>(
  ({ data, zoom, width, height, lineageDepth, dataEntityId, handleDepthChange }) => {
    const handleCenterRoot = React.useCallback(() => {
      zoom.center();
      zoom.reset();
    }, []);

    return (
      <Grid container position='relative'>
        <LineageControls
          handleCenterRoot={handleCenterRoot}
          lineageDepth={lineageDepth}
          handleDepthChange={handleDepthChange}
        />
        <S.Container
          $isDragging={zoom.isDragging}
          ref={zoom.containerRef}
          width={width}
          height={height}
          onMouseDown={zoom.dragStart}
          onMouseMove={zoom.dragMove}
          onMouseUp={zoom.dragEnd}
          onMouseLeave={() => {
            if (zoom.isDragging) zoom.dragEnd();
          }}
          onDoubleClick={event => {
            const point = localPoint(event) || { x: 0, y: 0 };
            zoom.scale({ scaleX: 1.1, scaleY: 1.1, point });
          }}
        >
          <rect width={width} height={height} fill='#F4F5F7' />
          <Group transform={zoom.toString()}>
            <LineageGraph
              data={data}
              dataEntityId={dataEntityId}
              handleDepthChange={handleDepthChange}
            />
          </Group>
        </S.Container>
      </Grid>
    );
  }
);

export default ZoomableLineage;
