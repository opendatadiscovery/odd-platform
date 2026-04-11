import React from 'react';
import { Box, Collapse, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { LinkedTerm } from 'generated-sources';
import { Permission } from 'generated-sources';
import { Button } from 'components/shared/elements';
import { AddIcon } from 'components/shared/icons';
import { WithPermissions } from 'components/shared/contexts';
import { useAppSelector } from 'redux/lib/hooks';
import { getIsEntityStatusDeleted } from 'redux/selectors';
import { TermsCaptionContainer } from './OverviewTermsStyles';
import AssignEntityTermForm from './AssignEntityTermForm/AssignEntityTermForm';
import TermItem from './TermItem/TermItem';

interface OverviewTermsProps {
  dataEntityId: number;
  terms?: LinkedTerm[];
}

const OverviewTerms: React.FC<OverviewTermsProps> = ({ terms, dataEntityId }) => {
  const { t } = useTranslation();
  const visibleLimit = 20;
  const [viewAll, setViewAll] = React.useState(false);

  const isStatusDeleted = useAppSelector(getIsEntityStatusDeleted(dataEntityId));

  return (
    <div>
      <TermsCaptionContainer>
        <Typography variant='h4'>{t('Dictionary terms')}</Typography>
        <WithPermissions permissionTo={Permission.DATA_ENTITY_ADD_TERM}>
          {!isStatusDeleted && (
            <AssignEntityTermForm
              dataEntityId={dataEntityId}
              openBtnEl={
                <Button
                  text={t('Add terms')}
                  buttonType='secondary-m'
                  startIcon={<AddIcon />}
                />
              }
            />
          )}
        </WithPermissions>
      </TermsCaptionContainer>
      {terms?.length ? (
        <Box sx={{ mx: -0.5, my: 0 }}>
          {terms
            .slice(0, visibleLimit)
            .sort()
            .map(linkedTerm => (
              <TermItem
                key={linkedTerm.term.id}
                linkedTerm={linkedTerm}
                dataEntityId={dataEntityId}
                isStatusDeleted={isStatusDeleted}
              />
            ))}
          {terms?.length > visibleLimit && (
            <>
              <Collapse in={viewAll} timeout='auto' unmountOnExit>
                {viewAll &&
                  terms
                    ?.slice(visibleLimit)
                    .sort()
                    .map(linkedTerm => (
                      <TermItem
                        key={linkedTerm.term.id}
                        linkedTerm={linkedTerm}
                        dataEntityId={dataEntityId}
                        isStatusDeleted={isStatusDeleted}
                      />
                    ))}
              </Collapse>
              <Button
                text={viewAll ? t('Hide') : `${t('View All')} (${terms?.length})`}
                buttonType='tertiary-m'
                sx={{ ml: 0.5, mt: 1.25 }}
                onClick={() => setViewAll(!viewAll)}
              />
            </>
          )}
        </Box>
      ) : (
        <Grid
          item
          xs={12}
          container
          alignItems='center'
          justifyContent='flex-start'
          wrap='nowrap'
        >
          <Typography variant='subtitle2'>{t('Not created')}.</Typography>
          <WithPermissions permissionTo={Permission.DATA_ENTITY_ADD_TERM}>
            {!isStatusDeleted && (
              <AssignEntityTermForm
                dataEntityId={dataEntityId}
                openBtnEl={<Button text={t('Add terms')} buttonType='tertiary-sm' />}
              />
            )}
          </WithPermissions>
        </Grid>
      )}
    </div>
  );
};

export default OverviewTerms;
