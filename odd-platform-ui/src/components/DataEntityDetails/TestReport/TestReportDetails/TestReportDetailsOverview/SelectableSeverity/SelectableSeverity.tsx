import React, { type FC, type MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import type { DataQualityTestSeverity } from 'generated-sources';
import { AppMenu, AppMenuItem, ConfirmationDialog } from 'components/shared/elements';
import { DropdownIcon } from 'components/shared/icons';
import { ORDERED_SEVERITY } from 'lib/constants';
import { setDataQATestSeverity } from 'redux/thunks';
import { useAppDispatch } from 'redux/lib/hooks';
import * as S from './SelectableSeverityStyles';

interface SelectableSeverityProps {
  currentSeverity: DataQualityTestSeverity;
  dataEntityId: number;
  dataQATestId: number;
  disabled?: boolean;
}

// DQ-test severity drives the dataset's SLA colour, so a change must be deliberate and the
// displayed value must equal the persisted record. This mirrors the entity-Status edit pattern
// (SelectableEntityStatus -> StatusSettingsForm -> store reduce): the current severity is shown
// (controlled, from the store), and choosing a new value opens the shared ConfirmationDialog
// previewing the change before the awaited mutation persists it and reduces into the store.
// See adrs/drafts/confirm-and-store-reduce-field-edits.md (CTRIB-015 / odd-platform#1750).
const SelectableSeverity: FC<SelectableSeverityProps> = ({
  currentSeverity,
  dataEntityId,
  dataQATestId,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const menuId = 'dq-severity-menu';
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: MouseEvent) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleConfirm = (next: DataQualityTestSeverity) => () =>
    dispatch(
      setDataQATestSeverity({
        dataEntityId,
        dataqaTestId: dataQATestId,
        dataQualityTestSeverityForm: { severity: next },
      })
    )
      .unwrap()
      .then(handleMenuClose);

  if (disabled) {
    return (
      <S.SeverityTrigger $disabled data-qa='dq-severity'>
        <Typography variant='body1'>{currentSeverity}</Typography>
      </S.SeverityTrigger>
    );
  }

  return (
    <>
      <S.SeverityTrigger onClick={handleMenuOpen} data-qa='dq-severity'>
        <Typography variant='body1'>{currentSeverity}</Typography>
        <DropdownIcon />
      </S.SeverityTrigger>
      <AppMenu
        anchorEl={anchorEl}
        open={isMenuOpen}
        id={menuId}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        minWidth={140}
      >
        {ORDERED_SEVERITY.map(severity =>
          severity === currentSeverity ? (
            <AppMenuItem
              key={severity}
              onClick={handleMenuClose}
              sx={{ fontWeight: 'bold' }}
            >
              {severity}
            </AppMenuItem>
          ) : (
            <ConfirmationDialog
              key={severity}
              actionBtn={<AppMenuItem>{severity}</AppMenuItem>}
              actionTitle={t('Change severity')}
              actionText={t('Change the severity from {{from}} to {{to}}?', {
                from: currentSeverity,
                to: severity,
              })}
              actionName={t('Apply')}
              onConfirm={handleConfirm(severity)}
            />
          )
        )}
      </AppMenu>
    </>
  );
};

export default SelectableSeverity;
