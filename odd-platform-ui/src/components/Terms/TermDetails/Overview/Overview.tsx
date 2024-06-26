import { Grid } from '@mui/material';
import React, { useMemo, type FC } from 'react';
import { SkeletonWrapper } from 'components/shared/elements';
import { Permission, PermissionResourceType } from 'generated-sources';
import { WithPermissionsProvider } from 'components/shared/contexts';
import { useTermsRouteParams } from 'routes';
import { useGetTermByID } from 'lib/hooks';
import { useResourcePermissions } from 'lib/hooks/api/permissions';
import OverviewGeneral from './OverviewGeneral/OverviewGeneral';
import OverviewSkeleton from './OverviewSkeleton/OverviewSkeleton';
import OverviewTags from './OverviewTags/OverviewTags';
import * as S from './OverviewStyles';
import TermLinkedTerms from './TermLinkedTerms/TermLinkedTerms';
import TermDefinition from './TermDefinition/TermDefinition';

const Overview: FC = () => {
  const { termId } = useTermsRouteParams();

  const { data: termDetails, isLoading: isTermDetailsFetching } = useGetTermByID({
    termId,
  });
  const { data: termPermissions } = useResourcePermissions({
    resourceId: termId,
    permissionResourceType: PermissionResourceType.TERM,
  });

  const linkedTerms = useMemo(() => termDetails?.terms || [], [termDetails]);
  const termsRef = useMemo(
    () => termDetails?.terms?.map(linkedTerm => linkedTerm.term),
    [termDetails?.terms]
  );

  return (
    <>
      {termDetails && !isTermDetailsFetching && (
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={8}>
            <S.DefinitionContainer elevation={9}>
              <TermDefinition
                termId={termId}
                definition={termDetails.definition ?? ''}
                terms={termsRef}
              />
            </S.DefinitionContainer>
          </Grid>
          <Grid item xs={4}>
            <S.Container square elevation={0}>
              <WithPermissionsProvider
                allowedPermissions={[
                  Permission.TERM_OWNERSHIP_CREATE,
                  Permission.TERM_OWNERSHIP_UPDATE,
                  Permission.TERM_OWNERSHIP_DELETE,
                ]}
                resourcePermissions={termPermissions ?? []}
                Component={OverviewGeneral}
              />
            </S.Container>
            <S.Container square elevation={0}>
              <WithPermissionsProvider
                  allowedPermissions={[Permission.TERM_TAGS_UPDATE]}
                  resourcePermissions={termPermissions ?? []}
                  render={() => <OverviewTags tags={termDetails.tags} />}
               />
            </S.Container>
            <S.Container square elevation={0}>
              <WithPermissionsProvider
                allowedPermissions={[Permission.TERM_UPDATE]}
                resourcePermissions={termPermissions ?? []}
                render={() => (
                  <TermLinkedTerms linkedTerms={linkedTerms} termId={termId} />
                )}
              />
            </S.Container>
          </Grid>
        </Grid>
      )}
      {isTermDetailsFetching && (
        <SkeletonWrapper
          renderContent={({ randWidth }) => <OverviewSkeleton width={randWidth()} />}
        />
      )}
    </>
  );
};

export default Overview;
