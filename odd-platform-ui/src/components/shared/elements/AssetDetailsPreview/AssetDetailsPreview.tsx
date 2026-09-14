import React, { type FC, useCallback, useRef } from 'react';
import type { PopperProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AssetKind } from 'generated-sources';
import { InformationIcon } from 'components/shared/icons';
import AppTooltip from '../AppTooltip/AppTooltip';
import TooltipBadge from '../AppTooltip/TooltipBadge';
import * as S from './AssetDetailsPreview.styles';
import { ClampedBlock } from './PreviewCard';
import DataEntityPreview from './DataEntityPreview';
import TermPreview from './TermPreview';
import QueryExamplePreview from './QueryExamplePreview';

// popper.js's instance type, as MUI exposes it through the Popper's `popperRef` prop (`@popperjs/core` is not a direct
// dependency of this package).
type PopperInstance =
  NonNullable<PopperProps['popperRef']> extends React.Ref<infer T> ? T : never;

interface AssetDetailsPreviewProps {
  assetKind: AssetKind;
  assetId: number;
}

/** The card's frame is 80vh tall at most; its content box is that minus the frame's two 16 px paddings. */
const cardContentBound = () => Math.floor(window.innerHeight * 0.8) - 32;

interface PreviewCardProps extends AssetDetailsPreviewProps {
  onMeasure: () => void;
}

/**
 * The body of the card, mounted only while the tooltip is open (MUI mounts `title` on open) — so the kind's own
 * detail read fires on open, never on the page render. The body sits in ONE card-level ClampedBlock at the frame's
 * bound: a card that would exceed 80vh shows its cut at the bottom instead of clipping silently.
 */
const PreviewCard: FC<PreviewCardProps> = ({ assetKind, assetId, onMeasure }) => (
  <S.Container data-testid='asset-details-preview-card' data-asset-kind={assetKind}>
    <ClampedBlock maxHeight={cardContentBound()} clamp='card' onMeasure={onMeasure}>
      {assetKind === AssetKind.TERM && <TermPreview id={assetId} />}
      {assetKind === AssetKind.QUERY_EXAMPLE && <QueryExamplePreview id={assetId} />}
      {assetKind === AssetKind.DATA_ENTITY && <DataEntityPreview id={assetId} />}
    </ClampedBlock>
  </S.Container>
);

/**
 * The (i) details preview of a catalog asset — ONE badge for every kind (#1899, the same shape #1894 gave the (?)
 * "why it matched" badge): an `InformationIcon` in an `AppTooltip` (ADR-0076) that opens a card saying WHAT the item
 * is — a Term's definition / namespace / owners / tags / linked counts, a Query Example's definition / links / query,
 * a Data Entity's tags / metadata / About — read from the kind's own detail endpoint when the card opens.
 *
 * Mechanics, shared with the (?) badge: both MUI delays are set so a pointer sweep down a list never fetches (MUI's
 * module-global 800 ms hysteresis swaps `enterDelay` for `enterNextDelay` after any tooltip closes); `followCursor`
 * is off so a keyboard-opened card anchors at the badge; the badge is a focusable, self-labelled span (TooltipBadge).
 * With `followCursor` off MUI positions the popper once, at open, against the still-empty card — so the element
 * keeps the popper's handle, lets `preventOverflow` shift the card vertically (`altAxis`), and re-runs the
 * positioning whenever the card's body re-measures (the fetched body landing, a late image): the LOADED card is the
 * one that is placed inside the viewport, tethered to the badge.
 */
const AssetDetailsPreview: FC<AssetDetailsPreviewProps> = ({ assetKind, assetId }) => {
  const { t } = useTranslation();
  const popperRef = useRef<PopperInstance | null>(null);
  const reposition = useCallback(() => {
    popperRef.current?.update();
  }, []);

  return (
    <AppTooltip
      checkForOverflow={false}
      followCursor={false}
      enterDelay={300}
      enterNextDelay={300}
      componentsProps={{
        popper: {
          popperRef,
          modifiers: [{ name: 'preventOverflow', options: { altAxis: true } }],
        },
      }}
      title={
        <PreviewCard assetKind={assetKind} assetId={assetId} onMeasure={reposition} />
      }
    >
      <TooltipBadge label={t('Show details')} testId='asset-details-preview'>
        <InformationIcon />
      </TooltipBadge>
    </AppTooltip>
  );
};

export default AssetDetailsPreview;
