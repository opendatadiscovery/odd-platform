import React from 'react';
import { Provider } from 'jotai';

const DEGLineageAtomProvider: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Provider>{children}</Provider>
);

export default DEGLineageAtomProvider;
