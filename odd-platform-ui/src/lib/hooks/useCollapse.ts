import {
  useState,
  useEffect,
  useRef,
  type CSSProperties,
  type RefObject,
  useMemo,
  useCallback,
} from 'react';

interface UseCollapseProps {
  initialCollapsed?: boolean;
  initialMaxHeight?: number;
  transitionDuration?: number;
  maxHeightReduceRatio?: number;
}

interface CollapsibleContentProps {
  style: CSSProperties;
}

interface UseCollapseReturn {
  contentRef: RefObject<HTMLDivElement>;
  isCollapsed: boolean;
  isCollapsible: boolean;
  toggleCollapse: () => void;
  updateCollapse: () => void;
  setCollapse: (collapse: boolean) => void;
  collapsibleContentProps: CollapsibleContentProps;
}

const useCollapse = ({
  initialCollapsed = true,
  initialMaxHeight = 200,
  transitionDuration = 300,
  maxHeightReduceRatio = 0.85,
}: UseCollapseProps): UseCollapseReturn => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [isCollapsible, setIsCollapsible] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);

  useEffect(() => {
    if (
      contentRef.current?.offsetHeight &&
      contentRef.current.offsetHeight * maxHeightReduceRatio > initialMaxHeight
    ) {
      setIsCollapsed(true);
      setIsCollapsible(true);
    } else {
      setIsCollapsed(false);
      setIsCollapsible(false);
    }
  }, [contentRef.current, initialMaxHeight, isUpdated]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const setCollapse = useCallback((collapse: boolean) => {
    setIsCollapsed(collapse);
    setIsCollapsible(collapse);
  }, []);

  const updateCollapse = useCallback(() => {
    setIsUpdated(prev => !prev);
  }, []);

  const collapsibleContentProps = useMemo<CollapsibleContentProps>(
    () => ({
      style: {
        maxHeight: isCollapsed ? `${initialMaxHeight}px` : 'none',
        overflow: 'hidden',
        transition: `max-height ${transitionDuration}ms ease-in-out`,
      },
    }),
    [isCollapsed, initialMaxHeight, transitionDuration]
  );

  return {
    contentRef,
    isCollapsed,
    toggleCollapse,
    updateCollapse,
    setCollapse,
    collapsibleContentProps,
    isCollapsible,
  };
};

export default useCollapse;
