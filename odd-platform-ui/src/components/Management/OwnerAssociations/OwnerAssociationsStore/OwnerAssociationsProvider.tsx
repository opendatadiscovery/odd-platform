import React from 'react';
import { Provider } from 'jotai';

const OwnerAssociationsAtomProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => <Provider>{children}</Provider>;

export default OwnerAssociationsAtomProvider;
