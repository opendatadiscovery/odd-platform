import React from 'react';
import * as Layout from 'components/shared/styled-components/layout';
import { DataQualityFilters } from './DataQualityFilters/DataQualityFilters';
import { DataQualityAtomProvider } from './DataQualityStore/DataQualityProvider';
import { DataQualityContent } from './DataQualityContent';

const DataQuality: React.FC = () => (
  <DataQualityAtomProvider>
    <Layout.LayoutContainer>
      <Layout.Sidebar $alignSelf='flex-start' $position='sticky'>
        <DataQualityFilters />
      </Layout.Sidebar>
      <Layout.Content>
        <DataQualityContent />
      </Layout.Content>
    </Layout.LayoutContainer>
  </DataQualityAtomProvider>
);

export default DataQuality;
