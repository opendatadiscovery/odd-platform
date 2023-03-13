import React from 'react';
import { Provider } from 'jotai';

const OwnerAssociationsAtomProvider: React.FC = ({ children }) => (
  <Provider>{children}</Provider>
);

export default OwnerAssociationsAtomProvider;
