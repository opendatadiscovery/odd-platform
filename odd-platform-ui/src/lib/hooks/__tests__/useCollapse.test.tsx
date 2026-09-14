import React, { useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import useCollapse from '../useCollapse';

/**
 * useCollapse — the toggle mode's three branches exactly as shipped (a DE overview block: fits → released, overflows →
 * clamped + a control, expanded on toggle) plus the two things #1899 added for the (i) details-preview card: a
 * non-toggle CLAMP mode (`collapsible: false` — the bound sticks, only the verdict moves, content that arrives after
 * mount can never flip the block to "expanded") and a resize re-measure (an image that loads late is no DOM
 * mutation). jsdom has no layout and no ResizeObserver: `scrollHeight` is stubbed per case, and a mock observer is
 * installed so its callback can be fired by hand.
 */

// the mock ResizeObserver: remembers every callback so a test can fire "the content changed size"
const observers: Array<() => void> = [];
class MockResizeObserver {
  private readonly cb: () => void;

  constructor(cb: () => void) {
    this.cb = cb;
    observers.push(cb);
  }

  observe() {}

  disconnect() {}
}

let scrollHeight = 0;
const setScrollHeight = (px: number) => {
  scrollHeight = px;
};

interface BlockProps {
  bound: number;
  collapsible?: boolean;
  onMeasure?: () => void;
  onRender?: () => void;
}

const Block: React.FC<BlockProps> = ({ bound, collapsible, onMeasure, onRender }) => {
  const renders = useRef(0);
  renders.current += 1;
  onRender?.();
  const { contentRef, containerStyle, controlsStyle, isCollapsed, toggleCollapse } =
    useCollapse({
      initialMaxHeight: bound,
      collapsible,
      onMeasure,
    });
  return (
    <div>
      <div ref={contentRef} style={containerStyle} data-testid='block'>
        content
      </div>
      <span data-testid='controls' style={controlsStyle}>
        controls
      </span>
      <span data-testid='collapsed'>{String(isCollapsed)}</span>
      <button type='button' onClick={toggleCollapse}>
        toggle
      </button>
    </div>
  );
};

const block = () => screen.getByTestId('block');
const controlsDisplay = () => screen.getByTestId('controls').style.display;
const fireResize = () => act(() => observers.forEach(cb => cb()));

describe('useCollapse', () => {
  beforeEach(() => {
    observers.length = 0;
    vi.stubGlobal('ResizeObserver', MockResizeObserver);
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get: () => scrollHeight,
    });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('the toggle mode (the default — the shipped behaviour)', () => {
    it('a block that fits is released to its own height and shows no control', () => {
      setScrollHeight(100);
      render(<Block bound={200} />);
      expect(block().style.maxHeight).toBe('none');
      expect(controlsDisplay()).toBe('none');
      expect(screen.getByTestId('collapsed')).toHaveTextContent('false');
    });

    it('a block that overflows is clamped at the bound with the control showing, and expands on toggle', async () => {
      setScrollHeight(500);
      render(<Block bound={200} />);
      expect(block().style.maxHeight).toBe('200px');
      expect(controlsDisplay()).toBe('block');
      await act(async () => {
        screen.getByText('toggle').click();
      });
      expect(block().style.maxHeight).toBe('500px');
      expect(controlsDisplay()).toBe('block');
    });

    it('a block that fitted at mount and grows later (a resize, e.g. an image load) is released with its control — not left clipped', () => {
      setScrollHeight(100);
      render(<Block bound={200} />);
      expect(block().style.maxHeight).toBe('none');
      setScrollHeight(500);
      fireResize();
      // the shipped landing for a released block that overflows: expanded to its content, the control shown
      expect(block().style.maxHeight).toBe('500px');
      expect(controlsDisplay()).toBe('block');
    });
  });

  describe('the clamp mode (collapsible: false — the (i) details-preview card)', () => {
    it('the bound sticks through fits → overflows → fits; only the verdict moves; the toggle is inert', async () => {
      setScrollHeight(100);
      render(<Block bound={200} collapsible={false} />);
      expect(block().style.maxHeight).toBe('200px');
      expect(block().style.position).toBe('relative');
      expect(controlsDisplay()).toBe('none');

      setScrollHeight(500);
      fireResize();
      expect(block().style.maxHeight, 'never the content height').toBe('200px');
      expect(controlsDisplay(), 'the cut is reported').toBe('block');

      await act(async () => {
        screen.getByText('toggle').click();
      });
      expect(block().style.maxHeight, 'a toggle changes nothing').toBe('200px');
      expect(screen.getByTestId('collapsed')).toHaveTextContent('true');

      setScrollHeight(150);
      fireResize();
      expect(controlsDisplay(), 'the cut goes when the content fits again').toBe('none');
      expect(block().style.maxHeight).toBe('200px');
    });

    it('onMeasure fires after every measurement, and unchanged measurements do not keep re-rendering', () => {
      setScrollHeight(100);
      const onMeasure = vi.fn();
      const onRender = vi.fn();
      render(
        <Block
          bound={200}
          collapsible={false}
          onMeasure={onMeasure}
          onRender={onRender}
        />
      );
      const rendersAfterMount = onRender.mock.calls.length;
      const measuresAfterMount = onMeasure.mock.calls.length;
      expect(measuresAfterMount).toBeGreaterThanOrEqual(1);

      fireResize();
      expect(onMeasure.mock.calls.length).toBe(measuresAfterMount + 1);
      expect(onRender.mock.calls.length, 'same geometry → no re-render').toBe(
        rendersAfterMount
      );

      setScrollHeight(500);
      fireResize();
      expect(onMeasure.mock.calls.length).toBe(measuresAfterMount + 2);
      const rendersAfterChange = onRender.mock.calls.length;
      expect(rendersAfterChange, 'a changed verdict re-renders').toBeGreaterThan(
        rendersAfterMount
      );

      // The container animates max-height over 0.5 s, so in a browser the observer fires on every frame of a toggle.
      // Every one of those measurements yields the same style + verdict; React may invoke the component once more
      // to bail out (a queued functional update after a real change cannot be compared eagerly), never per frame.
      for (let i = 0; i < 30; i += 1) fireResize();
      expect(onMeasure.mock.calls.length).toBe(measuresAfterMount + 32);
      expect(
        onRender.mock.calls.length,
        '30 unchanged measurements → at most one bail-out render'
      ).toBeLessThanOrEqual(rendersAfterChange + 1);
    });
  });
});
