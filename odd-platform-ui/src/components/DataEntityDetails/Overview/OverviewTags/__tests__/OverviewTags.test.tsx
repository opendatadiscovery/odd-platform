import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import type { Tag } from 'generated-sources';
import type * as SharedElements from 'components/shared/elements';
import { render, WithRoute } from 'lib/tests/testHelpers';
import OverviewTags from '../OverviewTags';

// The shared Button uses MUI styled() reading custom `palette.button` keys; the test harness
// (testHelpers) wires only the styled-components ThemeProvider, not the MUI ThemeProvider, so Button
// cannot resolve its theme here. Stub it (keeping TagItem real) — the unit under test is the tag-list
// ordering + the truncation hint, not the View-All toggle's styling.
vi.mock('components/shared/elements', async importOriginal => {
  const actual = await importOriginal<typeof SharedElements>();
  return {
    ...actual,
    Button: ({ text }: { text: React.ReactNode }) => (
      <button type='button'>{typeof text === 'string' ? text : null}</button>
    ),
  };
});

/**
 * CTRIB-026 / odd-platform#1768 — Overview sidebar tag-list truncation.
 *
 * Defect 1 (semantic bug): the list did `tags.slice(0, 20).sort(tagsCompare)` — it sliced the first
 * 20 tags in wire order BEFORE applying the "important first" comparator, so an important tag sitting
 * past index 19 never reached the visible list. The fix sorts the whole set once, THEN slices, so the
 * importance ordering is computed across all tags (collapsed view AND the View-All remainder).
 *
 * Defect 3 (UX): an inline "Showing N of M" hint makes the truncation visible without clicking.
 *
 * i18n is not initialised in tests, so `t('...')` returns the key; the Defect-3 assertion matches the
 * stable "Showing" prefix rather than an interpolated string. The edit form is gated behind
 * WithPermissions (no access in the empty test store -> not rendered), so no child mocks are needed.
 */

const ROUTE = '/dataentities/:dataEntityId/overview';
const ENTRY = '/dataentities/2001/overview';

// 20 unimportant tags in wire order, then ONE important tag LAST (wire index 20 — past the cap of 20).
const makeTags = (): Tag[] => {
  const tags: Tag[] = [];
  for (let i = 0; i < 20; i += 1) {
    tags.push({
      id: i + 1,
      name: `wire-tag-${String(i).padStart(2, '0')}`,
      important: false,
    });
  }
  tags.push({ id: 999, name: 'important-pii', important: true });
  return tags;
};

const renderTags = (tags: Tag[]) =>
  render(
    <WithRoute path={ROUTE}>
      <OverviewTags tags={tags} />
    </WithRoute>,
    { initialEntries: [ENTRY] }
  );

describe('OverviewTags truncation ordering (#1768)', () => {
  it('surfaces an important tag that sits past the 20-item cap (sort before slice)', () => {
    renderTags(makeTags());
    // RED on the pre-fix slice-then-sort: 'important-pii' (wire index 20) fell into the hidden
    // remainder. GREEN after sort-then-slice: it ranks first and is visible in the collapsed list.
    expect(screen.getByText('important-pii')).toBeInTheDocument();
  });

  it('renders the truncation hint when there are more tags than the visible cap', () => {
    renderTags(makeTags());
    // i18n off in tests -> key returned; match the stable "Showing" prefix.
    expect(screen.getByText(/^Showing/)).toBeInTheDocument();
  });

  it('renders no truncation hint when the list fits within the cap', () => {
    renderTags([{ id: 1, name: 'only-tag', important: false }]);
    expect(screen.queryByText(/^Showing/)).not.toBeInTheDocument();
  });
});
