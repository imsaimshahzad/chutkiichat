import { useCallback, useRef } from 'react';

interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  threshold?: number;
}

export const useLongPress = ({ onLongPress, onClick, threshold = 500 }: UseLongPressOptions) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);
  const touchStartPos = useRef({ x: 0, y: 0 });

  const start = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      isLongPress.current = false;
      
      // Store initial position for touch events
      if ('touches' in event && event.touches.length > 0) {
        touchStartPos.current = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };
      }

      timerRef.current = setTimeout(() => {
        isLongPress.current = true;
        onLongPress();
      }, threshold);
    },
    [onLongPress, threshold]
  );

  const clear = useCallback(
    (event: React.TouchEvent | React.MouseEvent, shouldTriggerClick = true) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      if (shouldTriggerClick && !isLongPress.current && onClick) {
        onClick();
      }
    },
    [onClick]
  );

  const move = useCallback(
    (event: React.TouchEvent) => {
      if (!timerRef.current) return;

      // Cancel if moved more than 10px
      if (event.touches.length > 0) {
        const deltaX = Math.abs(event.touches[0].clientX - touchStartPos.current.x);
        const deltaY = Math.abs(event.touches[0].clientY - touchStartPos.current.y);
        
        if (deltaX > 10 || deltaY > 10) {
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
        }
      }
    },
    []
  );

  return {
    onTouchStart: start,
    onTouchEnd: (e: React.TouchEvent) => clear(e, true),
    onTouchMove: move,
    onMouseDown: start,
    onMouseUp: (e: React.MouseEvent) => clear(e, true),
    onMouseLeave: (e: React.MouseEvent) => clear(e, false),
  };
};
