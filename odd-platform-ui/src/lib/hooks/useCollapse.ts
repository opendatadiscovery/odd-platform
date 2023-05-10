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
}

interface UseCollapseReturn {
  contentRef: RefObject<HTMLDivElement>;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  containerStyle: CSSProperties;
  controlsStyle: CSSProperties;
}

const useCollapse = ({ initialMaxHeight = 200 }: UseCollapseProps): UseCollapseReturn => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const mainContainerStyle: CSSProperties = {
    overflow: 'hidden',
    transition: 'max-height 0.5s, opacity 0.5s',
  };

  const [containerStyle, setContainerStyle] = useState<CSSProperties>({
    maxHeight: `${initialMaxHeight}px`,
    ...mainContainerStyle,
  });

  const [controlsStyle, setControlsStyle] = useState<CSSProperties>({ display: 'none' });

  const checkCollapse = useCallback(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;

    const contentHeight = contentElement.scrollHeight;
    if (contentHeight <= initialMaxHeight) {
      setContainerStyle({
        maxHeight: 'auto',
        ...mainContainerStyle,
      });
      setControlsStyle({ display: 'none' });
      setIsCollapsed(false);
    } else if (isCollapsed) {
      setContainerStyle({
        maxHeight: `${initialMaxHeight}px`,
        ...mainContainerStyle,
      });
      setControlsStyle({ display: 'block' });
    } else {
      setContainerStyle({
        maxHeight: `${contentHeight}px`,
        ...mainContainerStyle,
      });
      setControlsStyle({ display: 'block' });
    }
  }, [initialMaxHeight, isCollapsed]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(checkCollapse);
    const contentElement = contentRef.current;
    if (contentElement) {
      observer.observe(contentElement, { childList: true, subtree: true });
      checkCollapse();
    }
    return () => observer.disconnect();
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
