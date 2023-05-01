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
}

interface CollapsibleContentProps {
  style: CSSProperties;
}

interface UseCollapseReturn {
  contentRef: RefObject<HTMLDivElement>;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  collapsibleContentProps: CollapsibleContentProps;
}

const useCollapse = ({
  initialCollapsed = true,
  initialMaxHeight = 200,
  transitionDuration = 300,
}: UseCollapseProps): UseCollapseReturn => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  useEffect(() => {
    if (
      contentRef.current?.offsetHeight &&
      contentRef.current.offsetHeight > initialMaxHeight
    ) {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
  }, [contentRef, initialMaxHeight]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const collapsibleContentProps = useMemo(
    () => ({
      style: {
        maxHeight: isCollapsed ? `${initialMaxHeight}px` : 'none',
        overflow: 'hidden',
        transition: `max-height ${transitionDuration}ms ease-in-out`,
      },
    }),
    [isCollapsed, initialMaxHeight, transitionDuration]
  );

  return { contentRef, isCollapsed, toggleCollapse, collapsibleContentProps };
};

export default useCollapse;
