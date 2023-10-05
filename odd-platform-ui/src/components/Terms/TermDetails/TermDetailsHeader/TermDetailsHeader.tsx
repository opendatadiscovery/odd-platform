import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Button,
  AppMenuItem,
  AppPopover,
  ConfirmationDialog,
  EntityTypeItem,
} from 'components/shared/elements';
import { WithPermissions } from 'components/shared/contexts';
import { Permission, type TermDetails } from 'generated-sources';
import TermsForm from 'components/Terms/TermSearch/TermForm/TermsForm';
import { EditIcon, KebabIcon, TimeGapIcon } from 'components/shared/icons';
import { useAppDateTime } from 'lib/hooks';

interface TermDetailsHeaderProps {
  name: TermDetails['name'];
  updatedAt: TermDetails['updatedAt'];
  termId: TermDetails['id'];
  handleTermDelete: (id: number) => () => Promise<void>;
}
const TermDetailsHeader: React.FC<TermDetailsHeaderProps> = ({
  name,
  termId,
  updatedAt,
  handleTermDelete,
}) => {
  const { t } = useTranslation();
  const { formatDistanceToNowStrict } = useAppDateTime();

  const termUpdatedAt = React.useMemo(
    () => (
      <>
        <TimeGapIcon />
        <Typography variant='body1' sx={{ ml: 1 }}>
          {formatDistanceToNowStrict(updatedAt, { addSuffix: true })}
        </Typography>
      </>
    ),
    [updatedAt]
  );

  return (
    <Grid container alignItems='center' flexWrap='nowrap'>
      <Grid container alignItems='center'>
        <Typography variant='h1' noWrap sx={{ mr: 1 }}>
          {name}
        </Typography>
        <EntityTypeItem entityTypeName='DCT' />
      </Grid>
      <Grid container justifyContent='flex-end'>
        {termUpdatedAt}
        <WithPermissions permissionTo={Permission.TERM_UPDATE}>
          <TermsForm
            btnCreateEl={
              <Button
                text={t('Edit')}
                buttonType='secondary-m'
                startIcon={<EditIcon />}
                sx={{ ml: 1 }}
              />
            }
          />
        </WithPermissions>
        <WithPermissions permissionTo={Permission.TERM_DELETE}>
          <AppPopover
            renderOpenBtn={({ onClick, ariaDescribedBy }) => (
              <Button
                aria-describedby={ariaDescribedBy}
                buttonType='secondary-m'
                icon={<KebabIcon />}
                onClick={onClick}
                sx={{ ml: 1 }}
              />
            )}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: -5, horizontal: 67 }}
          >
            <ConfirmationDialog
              actionTitle={t('Are you sure you want to delete this term?')}
              actionName={t('Delete term')}
              actionText={
                <>
                  &quot;{name}&quot; {t('will be deleted permanently')}
                </>
              }
              onConfirm={handleTermDelete(termId)}
              actionBtn={<AppMenuItem>{t('Delete')}</AppMenuItem>}
            />
          </AppPopover>
        </WithPermissions>
      </Grid>
    </Grid>
  );
};

export default TermDetailsHeader;
