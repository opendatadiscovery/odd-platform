import {
  useState,
  useEffect,
  useRef,
  type CSSProperties,
  type RefObject,
  useCallback,
} from 'react';

interface UseCollapseProps {
  initialMaxHeight?: number;
  /**
   * `true` (the default, the shipped toggle behaviour): a block that fits is released to its own height, a block that
   * overflows is clamped until `toggleCollapse` expands it. `false` (a plain clamp — the (i) details-preview card,
   * #1899): the container's `max-height` is ALWAYS the bound and only the overflow verdict (`controlsStyle`) moves —
   * content that arrives or grows after mount (a fetched body, a late image) can never flip the block to "expanded",
   * which the toggle mode does the first time its content fits.
   */
  collapsible?: boolean;
  /** fires after every measurement, in every mode — e.g. to re-position a popper around a block that just grew */
  onMeasure?: () => void;
}

interface UseCollapseReturn {
  contentRef: RefObject<HTMLDivElement>;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  containerStyle: CSSProperties;
  controlsStyle: CSSProperties;
}

const useCollapse = ({
  initialMaxHeight = 200,
  collapsible = true,
  onMeasure,
}: UseCollapseProps): UseCollapseReturn => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const mainContainerStyle: CSSProperties = {
    overflow: 'hidden',
    transition: 'max-height 0.5s, opacity 0.5s',
    // the clamp mode positions its cut marker against the container
    ...(collapsible ? {} : { position: 'relative' }),
  };

  const [containerStyle, setContainerStyle] = useState<CSSProperties>({
    maxHeight: `${initialMaxHeight}px`,
    ...mainContainerStyle,
  });

  const [controlsStyle, setControlsStyle] = useState<CSSProperties>({ display: 'none' });

  // The latest callback, read at measurement time so the observers below are installed once.
  const onMeasureRef = useRef(onMeasure);
  onMeasureRef.current = onMeasure;

  const checkCollapse = useCallback(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;

    const contentHeight = contentElement.scrollHeight;
    const overflows = contentHeight > initialMaxHeight;

    let nextMaxHeight: CSSProperties['maxHeight'];
    let nextControls: CSSProperties['display'];
    if (!collapsible) {
      // the bound never moves; only the verdict does
      nextMaxHeight = `${initialMaxHeight}px`;
      nextControls = overflows ? 'block' : 'none';
    } else if (!overflows) {
      // released — no bound. (`'none'` is the CSS value; the earlier `'auto'` was invalid and left the inline bound in
      // place, which is why a fitting block that later grew stayed clipped until #1899's resize re-measure.)
      nextMaxHeight = 'none';
      nextControls = 'none';
      setIsCollapsed(false);
    } else if (isCollapsed) {
      nextMaxHeight = `${initialMaxHeight}px`;
      nextControls = 'block';
    } else {
      nextMaxHeight = `${contentHeight}px`;
      nextControls = 'block';
    }

    // Idempotent: a re-measure that changes nothing re-renders nothing. The container animates `max-height` over
    // 0.5 s, so the resize observer below fires on every frame of a toggle — without this check each frame would
    // re-render the (markdown) block.
    setContainerStyle(prev =>
      prev.maxHeight === nextMaxHeight
        ? prev
        : { maxHeight: nextMaxHeight, ...mainContainerStyle }
    );
    setControlsStyle(prev =>
      prev.display === nextControls ? prev : { display: nextControls }
    );
    onMeasureRef.current?.();
  }, [initialMaxHeight, isCollapsed, collapsible]);

  const toggleCollapse = useCallback(() => {
    if (!collapsible) return;
    setIsCollapsed(prev => !prev);
  }, [collapsible]);

  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return undefined;
    // Content that changes shape without a DOM mutation — an image that loads, a font that swaps — is only visible
    // to a resize observer; a block that fitted at mount and then grew used to stay clipped at the bound with no
    // control (`max-height: auto` is not valid CSS, so the inline bound persisted). Guarded: jsdom ships none.
    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(checkCollapse);
    const mutationObserver = new MutationObserver(checkCollapse);
    mutationObserver.observe(contentElement, { childList: true, subtree: true });
    resizeObserver?.observe(contentElement);
    checkCollapse();
    return () => {
      mutationObserver.disconnect();
      resizeObserver?.disconnect();
    };
  }, [checkCollapse]);

  return {
    contentRef,
    isCollapsed,
    toggleCollapse,
    containerStyle,
    controlsStyle,
  };
};

export default useCollapse;
