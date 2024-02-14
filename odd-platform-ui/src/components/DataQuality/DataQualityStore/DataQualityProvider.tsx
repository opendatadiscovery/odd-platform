import React from 'react';
import { Provider } from 'jotai';

export const DataQualityAtomProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => <Provider>{children}</Provider>;
