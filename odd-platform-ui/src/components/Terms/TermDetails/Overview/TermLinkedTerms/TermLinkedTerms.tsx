import React, { type FC, useCallback } from 'react';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Button } from 'components/shared/elements';
import { WithPermissions } from 'components/shared/contexts';
import type { LinkedTerm } from 'generated-sources';
import { Permission } from 'generated-sources';
import { useAddLinkedTermToTerm, useDeleteLinkedTermToTerm } from 'lib/hooks';
import * as S from '../TermOverview.styles';
import TermItem from './TermItem/TermItem';
import LinkedTermTermForm from './LinkedTermTermForm/LinkedTermTermForm';

interface LinkedTermTermsProps {
  linkedTerms: LinkedTerm[];
  termId: number;
}

const TermLinkedTerms: FC<LinkedTermTermsProps> = ({ linkedTerms, termId }) => {
  const { t } = useTranslation();

  const { mutateAsync: addTermMutation } = useAddLinkedTermToTerm({ termId });
  const { mutateAsync: deleteTermMutation } = useDeleteLinkedTermToTerm({ termId });

  const handleAddTerm = useCallback(
    async (linkedTerm: LinkedTerm) => {
      await addTermMutation({
        termId,
        linkedTermFormData: {
          linkedTermId: linkedTerm.term.id,
        },
      });
    },
    [termId]
  );

  const removeTerm = useCallback(
    async (linkedTermId: number) => {
      await deleteTermMutation({
        termId,
        linkedTermId,
      });
    },
    [termId]
  );

  const content = React.useMemo(
    () =>
      linkedTerms && linkedTerms.length > 0 ? (
        <Grid container mt={1}>
          {linkedTerms.map(({ term, isDescriptionLink }) => (
            <TermItem
              key={term.id}
              linkedTermId={term.id}
              name={term.name}
              definition={term.definition}
              termId={termId}
              removeTerm={removeTerm}
              isDescriptionLink={isDescriptionLink}
            />
          ))}
        </Grid>
      ) : (
        <Typography mt={1} variant='subtitle1'>
          {t('Terms are not added yet')}
        </Typography>
      ),
    [linkedTerms?.length, linkedTerms]
  );

  return (
    <S.SectionContainer container>
      <Grid container justifyContent='space-between'>
        <Typography variant='h5' color='texts.hint'>
          {t('TERMS')}
        </Typography>
        <WithPermissions
          permissionTo={Permission.TERM_UPDATE}
          renderContent={({ isAllowedTo: addTerm }) => (
            <LinkedTermTermForm
              termId={termId}
              handleAddTerm={handleAddTerm}
              openBtnEl={
                <Button
                  disabled={!addTerm}
                  text={t('Add term')}
                  buttonType='secondary-m'
                  sx={{ mr: 1 }}
                />
              }
            />
          )}
        />
      </Grid>
      <Grid container flexDirection='column' alignItems='flex-start'>
        {content}
      </Grid>
    </S.SectionContainer>
  );
};

export default TermLinkedTerms;
