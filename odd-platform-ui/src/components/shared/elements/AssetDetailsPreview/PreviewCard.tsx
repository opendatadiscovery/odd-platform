import React, { type FC, type PropsWithChildren, type ReactNode } from 'react';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Tag } from 'generated-sources';
import useCollapse from 'lib/hooks/useCollapse';
import AppCircularProgress from '../AppCircularProgress/AppCircularProgress';
import NumberFormatted from '../NumberFormatted/NumberFormatted';
import TruncatedList from '../TruncatedList/TruncatedList';
import TagItem from '../TagItem/TagItem';
import * as S from './AssetDetailsPreview.styles';

/**
 * The pieces every (i) details-preview card body shares (#1899): the three terminal states' bodies, a section
 * header with its count, the tags block, the overflow line of a capped list, and the bounded block that shows when
 * it is cut. The per-kind bodies (DataEntityPreview / TermPreview / QueryExamplePreview) compose these; nothing here
 * knows which kind it is rendering.
 */

/** "Loaded" is a payload with an id — never merely "not loading": `GET /api/terms/{missing}` answers 200 with an
 * empty body, and a rejected read must not render as an empty item ("No tags … Not created"). */
export const ready = <T extends { id?: number }>(data: T | undefined): data is T =>
  !!data?.id;

export const LoadingBody: FC = () => (
  <Grid container justifyContent='center' data-testid='asset-details-preview-loading'>
    <AppCircularProgress background='transparent' progressBackground='dark' size={50} />
  </Grid>
);

export const FailureBody: FC = () => {
  const { t } = useTranslation();
  return (
    <S.StateText variant='body1' data-testid='asset-details-preview-failed'>
      {t("Couldn't load details")}
    </S.StateText>
  );
};

interface SectionHeaderProps {
  title: string;
  /** a count shown right-aligned next to its unit, as the DE card's "3 tags" / "5 fields" */
  count?: number;
  unit?: string;
}

export const SectionHeader: FC<SectionHeaderProps> = ({ title, count, unit }) => (
  <Grid container justifyContent='space-between' sx={{ mb: 1 }}>
    <Typography variant='h4' color='text.primary'>
      {title}
    </Typography>
    {count !== undefined && (
      <Typography variant='subtitle1' color='texts.info'>
        <NumberFormatted value={count} /> {unit}
      </Typography>
    )}
  </Grid>
);

export const EmptyLine: FC<PropsWithChildren> = ({ children }) => (
  <Typography variant='body1' color='texts.secondary'>
    {children}
  </Typography>
);

/** The tags of an item — the DE card's one-line truncated list with its "few tags more" ellipsis, or "No tags". */
export const TagsBlock: FC<{ tags: Tag[] | undefined }> = ({ tags }) => {
  const { t } = useTranslation();
  if (!tags?.length) return <EmptyLine>{t('No tags')}</EmptyLine>;
  return (
    <TruncatedList
      items={tags}
      ellipsis={() => (
        <Typography variant='body1' color='texts.hint' sx={{ ml: 1 }} component='span'>
          {t('few tags more')}
        </Typography>
      )}
    >
      {tag => (
        <TagItem
          sx={{ mr: 0.5 }}
          key={tag.id}
          important={tag.important}
          label={tag.name}
        />
      )}
    </TruncatedList>
  );
};

/** The overflow line of a capped list: "+N more", in the user's locale. */
export const MoreLine: FC<{ count: number }> = ({ count }) => {
  const { t } = useTranslation();
  if (count <= 0) return null;
  return (
    <Typography variant='body1' component='div' data-testid='asset-details-preview-more'>
      <S.Muted>{t('+{{count}} more', { count })}</S.Muted>
    </Typography>
  );
};

export type ClampKind = 'card' | 'definition' | 'query';

interface ClampedBlockProps extends PropsWithChildren {
  /** the bound in px — the block never grows past it */
  maxHeight: number;
  clamp: ClampKind;
  /** fires after every measurement — the card-level block re-positions the popper with it */
  onMeasure?: () => void;
}

/**
 * A block that is never taller than its bound and SHOWS when it is cut — a fade over its last lines and a trailing
 * "…" — instead of clipping silently. The measurement is `useCollapse` in its clamp mode: the bound sticks, the
 * verdict follows the content on DOM mutation and on resize (a fetched body landing after the spinner, a late image).
 */
export const ClampedBlock: FC<ClampedBlockProps> = ({
  maxHeight,
  clamp,
  onMeasure,
  children,
}) => {
  const { contentRef, containerStyle, controlsStyle } = useCollapse({
    initialMaxHeight: maxHeight,
    collapsible: false,
    onMeasure,
  });
  const cut = controlsStyle.display === 'block';
  return (
    <div ref={contentRef} style={containerStyle} data-clamp-block={clamp}>
      {children}
      {cut && (
        <S.ClampedFade data-testid='asset-details-preview-cut' data-clamp={clamp}>
          …
        </S.ClampedFade>
      )}
    </div>
  );
};

/** A labelled value row of a card ("Namespace   finance"). */
export const Row: FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
  <Grid container wrap='nowrap' alignItems='baseline' sx={{ mt: 0.5 }}>
    <Typography
      variant='subtitle1'
      color='texts.hint'
      sx={{ minWidth: 130, mr: 1 }}
      noWrap
    >
      {label}
    </Typography>
    <Typography variant='body1' component='div' sx={{ minWidth: 0 }}>
      {children}
    </Typography>
  </Grid>
);
