import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom-v5-compat';
import { AppLoadingPage, RestrictedRoute, AppSuspenseWrapper } from 'components/shared';
import { useAppPaths, usePermissions } from 'lib/hooks';
import { Permission } from 'generated-sources';
import { WithPermissionsProvider } from 'components/shared/contexts';
import { Redirect, Switch } from 'react-router-dom';
import ManagementRoutes from './ManagementRoutes/ManagementRoutes';

import ManagementTabs from './ManagementTabs/ManagementTabs';
import * as S from './ManagementStyles';

// lazy components
const NamespaceList = React.lazy(() => import('./NamespaceList/NamespaceList'));
const OwnersList = React.lazy(() => import('./OwnersList/OwnersList'));
const LabelsList = React.lazy(() => import('./LabelsList/LabelsList'));
const TagsList = React.lazy(() => import('./TagsList/TagsList'));
const DataSourcesList = React.lazy(() => import('./DataSourcesList/DataSourcesList'));
const CollectorsList = React.lazy(() => import('./CollectorsList/CollectorsList'));
const OwnerAssociationsList = React.lazy(
  () => import('./OwnerAssociations/OwnerAssociations')
);
const RolesList = React.lazy(() => import('./RolesList/RolesList'));
const PolicyList = React.lazy(() => import('./PolicyList/PolicyList'));
const PolicyDetails = React.lazy(
  () => import('./PolicyList/PolicyDetails/PolicyDetails')
);

const Management: React.FC = () => {
  // const {
  //   managementPath,
  //   managementOwnerAssociationsPath,
  //   createPolicyPath,
  //   policyDetailsPath,
  //   ManagementRoutes,
  //   getNonExactPath,
  // } = useAppPaths();
  const { hasAccessTo } = usePermissions();

  return (
    <S.Container container wrap='nowrap'>
      <S.SidebarContainer item xs={3}>
        <ManagementTabs />
      </S.SidebarContainer>
      <S.ContentContainer item xs={9}>
        {/* <Routes> */}
        {/*   <Route */}
        {/*     path={ManagementRoutes.namespaces} */}
        {/*     element={ */}
        {/*       <WithPermissionsProvider */}
        {/*         allowedPermissions={[ */}
        {/*           Permission.NAMESPACE_UPDATE, */}
        {/*           Permission.NAMESPACE_DELETE, */}
        {/*           Permission.NAMESPACE_CREATE, */}
        {/*         ]} */}
        {/*         resourcePermissions={[]} */}
        {/*         Component={NamespaceList} */}
        {/*       /> */}
        {/*     } */}
        {/*   /> */}
        {/*   <Route */}
        {/*     path={ManagementRoutes.datasources} */}
        {/*     element={ */}
        {/*       <WithPermissionsProvider */}
        {/*         allowedPermissions={[ */}
        {/*           Permission.DATA_SOURCE_CREATE, */}
        {/*           Permission.DATA_SOURCE_UPDATE, */}
        {/*           Permission.DATA_SOURCE_DELETE, */}
        {/*           Permission.DATA_SOURCE_TOKEN_REGENERATE, */}
        {/*         ]} */}
        {/*         resourcePermissions={[]} */}
        {/*         Component={DataSourcesList} */}
        {/*       /> */}
        {/*     } */}
        {/*   /> */}
        {/*   /!* <Route *!/ */}
        {/*   /!*   path={managementPath(ManagementRoutesEnum.collectors)} *!/ */}
        {/*   /!*   element={ *!/ */}
        {/*   /!*     <WithPermissionsProvider *!/ */}
        {/*   /!*       allowedPermissions={[ *!/ */}
        {/*   /!*         Permission.COLLECTOR_CREATE, *!/ */}
        {/*   /!*         Permission.COLLECTOR_UPDATE, *!/ */}
        {/*   /!*         Permission.COLLECTOR_DELETE, *!/ */}
        {/*   /!*         Permission.COLLECTOR_TOKEN_REGENERATE, *!/ */}
        {/*   /!*       ]} *!/ */}
        {/*   /!*       resourcePermissions={[]} *!/ */}
        {/*   /!*       Component={CollectorsList} *!/ */}
        {/*   /!*     /> *!/ */}
        {/*   /!*   } *!/ */}
        {/*   /!* /> *!/ */}
        {/*   /!* <Route *!/ */}
        {/*   /!*   path={managementPath(ManagementRoutesEnum.owners)} *!/ */}
        {/*   /!*   element={ *!/ */}
        {/*   /!*     <WithPermissionsProvider *!/ */}
        {/*   /!*       allowedPermissions={[ *!/ */}
        {/*   /!*         Permission.OWNER_CREATE, *!/ */}
        {/*   /!*         Permission.OWNER_UPDATE, *!/ */}
        {/*   /!*         Permission.OWNER_DELETE, *!/ */}
        {/*   /!*       ]} *!/ */}
        {/*   /!*       resourcePermissions={[]} *!/ */}
        {/*   /!*       Component={OwnersList} *!/ */}
        {/*   /!*     /> *!/ */}
        {/*   /!*   } *!/ */}
        {/*   /!* /> *!/ */}
        {/*   /!* <Route *!/ */}
        {/*   /!*   path={managementPath(ManagementRoutesEnum.tags)} *!/ */}
        {/*   /!*   element={ *!/ */}
        {/*   /!*     <WithPermissionsProvider *!/ */}
        {/*   /!*       allowedPermissions={[ *!/ */}
        {/*   /!*         Permission.TAG_CREATE, *!/ */}
        {/*   /!*         Permission.TAG_UPDATE, *!/ */}
        {/*   /!*         Permission.TAG_DELETE, *!/ */}
        {/*   /!*       ]} *!/ */}
        {/*   /!*       resourcePermissions={[]} *!/ */}
        {/*   /!*       Component={TagsList} *!/ */}
        {/*   /!*     /> *!/ */}
        {/*   /!*   } *!/ */}
        {/*   /!* /> *!/ */}
        {/*   /!* <Route *!/ */}
        {/*   /!*   path={managementPath(ManagementRoutesEnum.labels)} *!/ */}
        {/*   /!*   element={ *!/ */}
        {/*   /!*     <WithPermissionsProvider *!/ */}
        {/*   /!*       allowedPermissions={[ *!/ */}
        {/*   /!*         Permission.LABEL_CREATE, *!/ */}
        {/*   /!*         Permission.LABEL_UPDATE, *!/ */}
        {/*   /!*         Permission.LABEL_DELETE, *!/ */}
        {/*   /!*       ]} *!/ */}
        {/*   /!*       resourcePermissions={[]} *!/ */}
        {/*   /!*       Component={LabelsList} *!/ */}
        {/*   /!*     /> *!/ */}
        {/*   /!*   } *!/ */}
        {/*   /!* /> *!/ */}
        {/*   /!* <Route *!/ */}
        {/*   /!*   path={managementOwnerAssociationsPath()} *!/ */}
        {/*   /!*   element={ *!/ */}
        {/*   /!*     <RestrictedRoute *!/ */}
        {/*   /!*       isAllowedTo={hasAccessTo(Permission.OWNER_ASSOCIATION_MANAGE)} *!/ */}
        {/*   /!*       redirectTo={managementPath(ManagementRoutesEnum.namespaces)} *!/ */}
        {/*   /!*       component={OwnerAssociationsList} *!/ */}
        {/*   /!*     /> *!/ */}
        {/*   /!*   } *!/ */}
        {/*   /!* /> *!/ */}
        {/*   /!* <Route *!/ */}
        {/*   /!*   path={managementPath(ManagementRoutesEnum.roles)} *!/ */}
        {/*   /!*   element={ *!/ */}
        {/*   /!*     <WithPermissionsProvider *!/ */}
        {/*   /!*       allowedPermissions={[ *!/ */}
        {/*   /!*         Permission.ROLE_CREATE, *!/ */}
        {/*   /!*         Permission.ROLE_UPDATE, *!/ */}
        {/*   /!*         Permission.ROLE_DELETE, *!/ */}
        {/*   /!*       ]} *!/ */}
        {/*   /!*       resourcePermissions={[]} *!/ */}
        {/*   /!*       Component={RolesList} *!/ */}
        {/*   /!*     /> *!/ */}
        {/*   /!*   } *!/ */}
        {/*   /!* /> *!/ */}
        {/*   /!* <Route *!/ */}
        {/*   /!*   path={managementPath(ManagementRoutesEnum.policies)} *!/ */}
        {/*   /!*   element={ *!/ */}
        {/*   /!*     <WithPermissionsProvider *!/ */}
        {/*   /!*       allowedPermissions={[ *!/ */}
        {/*   /!*         Permission.POLICY_CREATE, *!/ */}
        {/*   /!*         Permission.POLICY_UPDATE, *!/ */}
        {/*   /!*         Permission.POLICY_DELETE, *!/ */}
        {/*   /!*       ]} *!/ */}
        {/*   /!*       resourcePermissions={[]} *!/ */}
        {/*   /!*       Component={PolicyList} *!/ */}
        {/*   /!*     /> *!/ */}
        {/*   /!*   } *!/ */}
        {/*   /!* /> *!/ */}
        {/*   /!* {[createPolicyPath(), policyDetailsPath()].map(path => ( *!/ */}
        {/*   /!*   <Route *!/ */}
        {/*   /!*     key={path} *!/ */}
        {/*   /!*     path={path} *!/ */}
        {/*   /!*     element={ *!/ */}
        {/*   /!*       <WithPermissionsProvider *!/ */}
        {/*   /!*         allowedPermissions={[Permission.POLICY_UPDATE]} *!/ */}
        {/*   /!*         resourcePermissions={[]} *!/ */}
        {/*   /!*         Component={PolicyDetails} *!/ */}
        {/*   /!*       /> *!/ */}
        {/*   /!*     } *!/ */}
        {/*   /!*   /> *!/ */}
        {/*   /!* ))} *!/ */}
        {/*   /!* <Route *!/ */}
        {/*   /!*   path={managementPath(ManagementRoutesEnum.associations)} *!/ */}
        {/*   /!*   element={ *!/ */}
        {/*   /!*     <Navigate *!/ */}
        {/*   /!*       to={managementOwnerAssociationsPath(ManagementRoutesEnum.associationsNew)} *!/ */}
        {/*   /!*       replace *!/ */}
        {/*   /!*     /> *!/ */}
        {/*   /!*   } *!/ */}
        {/*   /!* /> *!/ */}
        {/*   <Route */}
        {/*     path='/' */}
        {/*     element={<Navigate to={ManagementRoutes.namespaces} replace />} */}
        {/*   /> */}
        {/* </Routes> */}
        <AppSuspenseWrapper>
          <ManagementRoutes />
        </AppSuspenseWrapper>
        {/* <React.Suspense fallback={<AppLoadingPage />}> */}
        {/*   <Routes> */}
        {/*     <Route */}
        {/*       exact */}
        {/*       path={managementPath(ManagementRoutes.namespaces)} */}
        {/*       render={() => ( */}
        {/*         <WithPermissionsProvider */}
        {/*           allowedPermissions={[ */}
        {/*             Permission.NAMESPACE_UPDATE, */}
        {/*             Permission.NAMESPACE_DELETE, */}
        {/*             Permission.NAMESPACE_CREATE, */}
        {/*           ]} */}
        {/*           resourcePermissions={[]} */}
        {/*           Component={NamespaceList} */}
        {/*         /> */}
        {/*       )} */}
        {/*     /> */}
        {/*     <Route */}
        {/*       exact */}
        {/*       path={managementPath(ManagementRoutes.datasources)} */}
        {/*       render={() => ( */}
        {/*         <WithPermissionsProvider */}
        {/*           allowedPermissions={[ */}
        {/*             Permission.DATA_SOURCE_CREATE, */}
        {/*             Permission.DATA_SOURCE_UPDATE, */}
        {/*             Permission.DATA_SOURCE_DELETE, */}
        {/*             Permission.DATA_SOURCE_TOKEN_REGENERATE, */}
        {/*           ]} */}
        {/*           resourcePermissions={[]} */}
        {/*           Component={DataSourcesList} */}
        {/*         /> */}
        {/*       )} */}
        {/*     /> */}
        {/*     <Route */}
        {/*       exact */}
        {/*       path={managementPath(ManagementRoutes.collectors)} */}
        {/*       render={() => ( */}
        {/*         <WithPermissionsProvider */}
        {/*           allowedPermissions={[ */}
        {/*             Permission.COLLECTOR_CREATE, */}
        {/*             Permission.COLLECTOR_UPDATE, */}
        {/*             Permission.COLLECTOR_DELETE, */}
        {/*             Permission.COLLECTOR_TOKEN_REGENERATE, */}
        {/*           ]} */}
        {/*           resourcePermissions={[]} */}
        {/*           Component={CollectorsList} */}
        {/*         /> */}
        {/*       )} */}
        {/*     /> */}
        {/*     <Route */}
        {/*       exact */}
        {/*       path={managementPath(ManagementRoutes.owners)} */}
        {/*       render={() => ( */}
        {/*         <WithPermissionsProvider */}
        {/*           allowedPermissions={[ */}
        {/*             Permission.OWNER_CREATE, */}
        {/*             Permission.OWNER_UPDATE, */}
        {/*             Permission.OWNER_DELETE, */}
        {/*           ]} */}
        {/*           resourcePermissions={[]} */}
        {/*           Component={OwnersList} */}
        {/*         /> */}
        {/*       )} */}
        {/*     /> */}
        {/*     <Route */}
        {/*       exact */}
        {/*       path={managementPath(ManagementRoutes.tags)} */}
        {/*       render={() => ( */}
        {/*         <WithPermissionsProvider */}
        {/*           allowedPermissions={[ */}
        {/*             Permission.TAG_CREATE, */}
        {/*             Permission.TAG_UPDATE, */}
        {/*             Permission.TAG_DELETE, */}
        {/*           ]} */}
        {/*           resourcePermissions={[]} */}
        {/*           Component={TagsList} */}
        {/*         /> */}
        {/*       )} */}
        {/*     /> */}
        {/*     <Route */}
        {/*       exact */}
        {/*       path={managementPath(ManagementRoutes.labels)} */}
        {/*       render={() => ( */}
        {/*         <WithPermissionsProvider */}
        {/*           allowedPermissions={[ */}
        {/*             Permission.LABEL_CREATE, */}
        {/*             Permission.LABEL_UPDATE, */}
        {/*             Permission.LABEL_DELETE, */}
        {/*           ]} */}
        {/*           resourcePermissions={[]} */}
        {/*           Component={LabelsList} */}
        {/*         /> */}
        {/*       )} */}
        {/*     /> */}
        {/*     /!* <RestrictedRoute *!/ */}
        {/*     /!*   isAllowedTo={hasAccessTo(Permission.OWNER_ASSOCIATION_MANAGE)} *!/ */}
        {/*     /!*   redirectTo={managementPath(ManagementRoutes.namespaces)} *!/ */}
        {/*     /!*   path={managementOwnerAssociationsPath()} *!/ */}
        {/*     /!*   component={OwnerAssociationsList} *!/ */}
        {/*     /!* /> *!/ */}
        {/*     <Route */}
        {/*       exact */}
        {/*       path={managementPath(ManagementRoutes.roles)} */}
        {/*       render={() => ( */}
        {/*         <WithPermissionsProvider */}
        {/*           allowedPermissions={[ */}
        {/*             Permission.ROLE_CREATE, */}
        {/*             Permission.ROLE_UPDATE, */}
        {/*             Permission.ROLE_DELETE, */}
        {/*           ]} */}
        {/*           resourcePermissions={[]} */}
        {/*           Component={RolesList} */}
        {/*         /> */}
        {/*       )} */}
        {/*     /> */}
        {/*     <Route */}
        {/*       exact */}
        {/*       path={managementPath(ManagementRoutes.policies)} */}
        {/*       render={() => ( */}
        {/*         <WithPermissionsProvider */}
        {/*           allowedPermissions={[ */}
        {/*             Permission.POLICY_CREATE, */}
        {/*             Permission.POLICY_UPDATE, */}
        {/*             Permission.POLICY_DELETE, */}
        {/*           ]} */}
        {/*           resourcePermissions={[]} */}
        {/*           Component={PolicyList} */}
        {/*         /> */}
        {/*       )} */}
        {/*     /> */}
        {/*     <Route */}
        {/*       exact */}
        {/*       path={[createPolicyPath(), policyDetailsPath()]} */}
        {/*       render={() => ( */}
        {/*         <WithPermissionsProvider */}
        {/*           allowedPermissions={[Permission.POLICY_UPDATE]} */}
        {/*           resourcePermissions={[]} */}
        {/*           Component={PolicyDetails} */}
        {/*         /> */}
        {/*       )} */}
        {/*     /> */}
        {/*     /!* <Redirect *!/ */}
        {/*     /!*   exact *!/ */}
        {/*     /!*   from={managementPath(ManagementRoutes.associations)} *!/ */}
        {/*     /!*   to={managementOwnerAssociationsPath(ManagementRoutes.associationsNew)} *!/ */}
        {/*     /!* /> *!/ */}
        {/*   </Routes> */}
        {/* </React.Suspense> */}
      </S.ContentContainer>
    </S.Container>
  );
};

export default Management;
