import React from 'react';
import { Zoom } from 'components/DataEntityDetails/Lineage/lineageLib/interfaces';
import { AlertIcon, CloseIcon, SlackIcon } from 'components/shared/Icons';
import * as S from 'components/DataEntityDetails/Lineage/ZoomableLineage/ZoomableLineageStyles';
import { Group } from '@visx/group';
import { getTransform } from 'components/DataEntityDetails/Lineage/lineageLib/helpers';
import { Grid, SelectChangeEvent } from '@mui/material';
import LineageControls from 'components/DataEntityDetails/Lineage/ZoomableLineage/LineageControls/LineageControls';
import LineageGraph from 'components/DataEntityDetails/Lineage/ZoomableLineage/LineageGraph/LineageGraph';
import { DataEntityLineageById } from 'redux/interfaces';

interface ZoomableLineageProps {
  data: DataEntityLineageById;
  zoom: Zoom;
  width: number;
  height: number;
  dataEntityId: number;
  lineageDepth: number;
  handleDepthChange: (e: SelectChangeEvent<unknown> | number) => void;
}
const ZoomableLineage: React.FC<ZoomableLineageProps> = ({
  data,
  zoom,
  width,
  height,
  lineageDepth,
  dataEntityId,
  handleDepthChange,
}) => {
  const [compactView, setCompactView] = React.useState(false);

  const handleSetCompactView = React.useCallback(
    (isCompact: boolean) => setCompactView(isCompact),
    []
  );

  const handleCenterRoot = React.useCallback(() => {
    zoom.center();
    zoom.reset();
  }, []);

  // React.useEffect(() => {
  //   zoom.setTransformMatrix({
  //     ...zoom.transformMatrix,
  //     translateY: height / 2,
  //     translateX: width / 2,
  //   });
  // }, []);

  return (
    <Grid container position='relative'>
      <LineageControls
        compactView={compactView}
        handleSetCompactView={handleSetCompactView}
        handleCenterRoot={handleCenterRoot}
        lineageDepth={lineageDepth}
        handleDepthChange={handleDepthChange}
      />
      <S.Container
        $isDragging={zoom.isDragging}
        ref={zoom.containerRef}
        width='100%'
        height='100%'
        viewBox={`0 0 ${width} ${height}`}
        onMouseDown={() => zoom.dragStart}
        onMouseUp={() => zoom.dragEnd}
        onMouseMove={e => zoom.dragMove(e)}
        // onTouchStart={zoom.dragStart}
        // onTouchMove={e => {
        //   zoom.dragMove(e);
        // }}
        // onTouchEnd={zoom.dragEnd}
      >
        <Group transform={zoom.toString()}>
          <LineageGraph
            data={data}
            compactView={compactView}
            dataEntityId={dataEntityId}
            handleDepthChange={handleDepthChange}
          />
        </Group>
      </S.Container>
    </Grid>
  );
};
export default ZoomableLineage;
