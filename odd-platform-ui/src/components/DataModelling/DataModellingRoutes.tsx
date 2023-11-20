import React from 'react';
import { AppSuspenseWrapper } from 'components/shared/elements';
import { Route, Routes } from 'react-router-dom';
import { useAppPaths } from 'lib/hooks';
import QueryExamplesContainer from './QueryExamplesContainer';
import QueryExampleDetails from './QueryExampleDetails/QueryExampleDetails';

const DataModellingRoutes: React.FC = () => {
  const { DataModellingRoutes: routes } = useAppPaths();
  return (
    <AppSuspenseWrapper>
      <Routes>
        <Route path={routes.queryExamples} element={<QueryExamplesContainer />} />
        <Route
          path={`${routes.queryExamples}/${routes.queryExampleIdParam}`}
          element={<QueryExampleDetails />}
        />
      </Routes>
    </AppSuspenseWrapper>
  );
};

export default DataModellingRoutes;
