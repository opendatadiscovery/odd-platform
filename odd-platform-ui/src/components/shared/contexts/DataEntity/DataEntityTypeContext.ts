import { createContext } from 'react';
import type { DataEntityType } from 'generated-sources';

const DataEntityTypeContext = createContext<DataEntityType | undefined>(undefined);

export default DataEntityTypeContext;
