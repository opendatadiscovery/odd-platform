import React from 'react';
import { generateNodeSize } from '../generateNodeSize';
import LineageContext, { type LineageContextProps } from './LineageContext';

type LineageProviderProps = Omit<LineageContextProps, 'nodeSize' | 'nodeTitleLayout'>;

const LineageProvider: React.FC<LineageProviderProps> = ({
  compact,
  children,
  setCompactView,
}) => {
  const nodeSize = generateNodeSize(compact);

  const providerValue = React.useMemo<LineageContextProps>(
    () => ({ compact, nodeSize, setCompactView }),
    [compact, setCompactView]
  );

  return (
    <LineageContext.Provider value={providerValue}>{children}</LineageContext.Provider>
  );
};

export default LineageProvider;
