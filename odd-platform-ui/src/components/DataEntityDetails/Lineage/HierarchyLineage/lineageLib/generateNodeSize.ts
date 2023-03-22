import type { NodeSize } from 'components/DataEntityDetails/Lineage/HierarchyLineage/lineageLib/interfaces';
import {
  NODE_WIDTH,
  NODE_INDENT_LEFT,
  INFO_LINE_HEIGHT,
  INFO_LABEL_WIDTH,
  NODE_LINE_HEIGHT,
  NODE_LINE_MX,
  NODE_HEIGHT_WITHOUT_TITLE,
  NODE_COMPACT_HEIGHT_WITHOUT_TITLE,
  LOAD_MORE_LAYER_WIDTH,
  LOAD_MORE_BUTTON_WIDTH,
  LOAD_MORE_BUTTON_HEIGHT,
  NODE_MIN_TITLE_HEIGHT,
  INFO_MIN_ODDRN_HEIGHT,
} from 'components/DataEntityDetails/Lineage/HierarchyLineage/lineageLib/constants';

interface GenerateNodeSizeProps {
  full: boolean;
  titleHeight: number;
  oddrnHeight?: number;
}

export const generateNodeSize = ({
  full,
  titleHeight,
  oddrnHeight = INFO_MIN_ODDRN_HEIGHT,
}: GenerateNodeSizeProps): NodeSize => {
  type Content = NodeSize['content'];

  const size: NodeSize['size'] = {
    width: NODE_WIDTH,
    height: full
      ? NODE_HEIGHT_WITHOUT_TITLE + titleHeight + oddrnHeight / 2
      : NODE_COMPACT_HEIGHT_WITHOUT_TITLE + titleHeight,
    mx: 150,
    my: 24,
    contentWidth: NODE_WIDTH - NODE_INDENT_LEFT * 3,
  };

  const title: Content['title'] = {
    x: NODE_INDENT_LEFT,
    y: NODE_LINE_HEIGHT,
    height: titleHeight || NODE_MIN_TITLE_HEIGHT,
    width: size.width - NODE_INDENT_LEFT * 2,
  };

  const hiddenDeps: Content['hiddenDeps'] = {
    x: NODE_INDENT_LEFT,
    y: title.y + title.height + 4,
  };

  const info: Content['info'] = {
    x: NODE_INDENT_LEFT,
    y: hiddenDeps.y + NODE_LINE_MX * 5 + 4,
    oddrnHeight: oddrnHeight + 8,
    lineHeight: INFO_LINE_HEIGHT,
    labelWidth: INFO_LABEL_WIDTH,
    contentWidth: size.width - title.x * 3 - INFO_LABEL_WIDTH,
  };

  const classes: Content['classes'] = {
    x: NODE_INDENT_LEFT,
    y: full ? info.y + info.lineHeight * 3.5 : info.y - NODE_LINE_MX,
    width: 24,
    height: 16,
    mx: 2,
  };

  const loadMore: Content['loadMore'] = {
    layer: {
      x: size.width,
      y: 0,
      width: LOAD_MORE_LAYER_WIDTH,
      height: size.height,
    },
    button: {
      x: size.width + LOAD_MORE_BUTTON_WIDTH / 2 + 16,
      y: size.height / 2 + LOAD_MORE_BUTTON_HEIGHT / 6,
      width: LOAD_MORE_BUTTON_WIDTH,
      height: LOAD_MORE_BUTTON_HEIGHT,
    },
  };

  return {
    size,
    content: { title, hiddenDeps, info, classes, loadMore },
  };
};
