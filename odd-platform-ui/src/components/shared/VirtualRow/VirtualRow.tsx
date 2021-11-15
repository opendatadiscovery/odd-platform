import React, { CSSProperties } from 'react';
import { DynamicListContext } from '../VirtualList/VirtualList';

interface VirtualRowProps {
  index: number;
  width: number;
  data: Array<JSX.Element | null>;
  style: CSSProperties;
}

const VirtualRow: React.FC<VirtualRowProps> = ({
  index,
  style,
  data,
  width,
}) => {
  const { setSize } = React.useContext(DynamicListContext);
  const rowRoot = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (rowRoot.current && setSize) {
      setSize(index, rowRoot.current.getBoundingClientRect().height);
    }
  }, [index, setSize, width]);

  return (
    <div style={style}>
      <div ref={rowRoot}>{data[index]}</div>
    </div>
  );
};

export default VirtualRow;
