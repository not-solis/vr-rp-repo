import { useCallback, useEffect, useState } from 'react';

/**
 * Threshold to reset start pos on drag if scroll dx or dy exceeds it.
 */
const DRAG_RESET_THRESHOLD = 1000;

interface DragScrollProps {
  onDragEnd?: (nodeEle: HTMLElement | null) => void;
}
export const useDragScroll = (props?: DragScrollProps) => {
  const { onDragEnd = () => {} } = props ?? {};
  const [node, setNode] = useState<HTMLElement | null>(null);

  const ref = useCallback((nodeEle: HTMLElement | null) => {
    setNode(nodeEle);
  }, []);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (!node) {
        return;
      }
      const startPos = {
        width: node.scrollWidth,
        height: node.scrollHeight,
        left: node.scrollLeft,
        top: node.scrollTop,
        x: e.clientX,
        y: e.clientY,
      };

      const resetStartPos = (
        x: number,
        y: number,
        offsetX: boolean = false,
      ) => {
        console.log(x, y, offsetX);
        startPos.left =
          node.scrollLeft + (offsetX ? node.scrollWidth - startPos.width : 0);
        startPos.top = node.scrollTop;
        startPos.width = node.scrollWidth;
        startPos.height = node.scrollHeight;
        startPos.x = x;
        startPos.y = y;
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (
          node.scrollWidth !== startPos.width ||
          node.scrollHeight !== startPos.height
        ) {
          console.log(node.scrollLeft);
          console.log(startPos.width);
          console.log(node.clientWidth);
          resetStartPos(
            e.clientX,
            e.clientY,
            node.scrollLeft < (startPos.width - node.clientWidth) / 2,
          );
        }
        const dx = e.clientX - startPos.x;
        const dy = e.clientY - startPos.y;
        node.scrollTop = startPos.top - dy;
        node.scrollLeft = startPos.left - dx;
        updateCursor(node);
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        resetCursor(node);
        onDragEnd(node);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [node],
  );

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!node) {
        return;
      }
      const touch = e.touches[0];
      const startPos = {
        width: node.scrollWidth,
        height: node.scrollHeight,
        left: node.scrollLeft,
        top: node.scrollTop,
        x: touch.clientX,
        y: touch.clientY,
      };

      const resetStartPos = (x: number, y: number) => {
        startPos.width = node.scrollWidth;
        startPos.height = node.scrollHeight;
        startPos.left = node.scrollWidth;
        startPos.top = node.scrollTop;
        startPos.x = x;
        startPos.y = y;
      };

      const handleTouchMove = (e: TouchEvent) => {
        const touch = e.touches[0];
        if (
          node.scrollWidth !== startPos.width ||
          node.scrollHeight !== startPos.height
        ) {
          resetStartPos(touch.clientX, touch.clientY);
        }
        const dx = touch.clientX - startPos.x;
        const dy = touch.clientY - startPos.y;
        const scrollLeft = startPos.left - dx;
        const scrollTop = startPos.top - dy;
        if (Math.abs(node.scrollLeft - scrollLeft) > DRAG_RESET_THRESHOLD) {
          startPos.left = node.scrollLeft - dx;
        }
        if (Math.abs(node.scrollTop - scrollTop) > DRAG_RESET_THRESHOLD) {
          startPos.top = node.scrollTop - dy;
        }
        node.scrollTop = startPos.top - dy;
        node.scrollLeft = startPos.left - dx;
        updateCursor(node);
      };

      const handleTouchEnd = () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        resetCursor(node);
        onDragEnd(node);
      };

      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    },
    [node],
  );

  const updateCursor = (ele: HTMLElement) => {
    ele.style.cursor = 'grabbing';
    ele.style.userSelect = 'none';
  };

  const resetCursor = (ele: HTMLElement) => {
    ele.style.cursor = 'grab';
    ele.style.removeProperty('user-select');
  };

  useEffect(() => {
    if (!node) {
      return;
    }
    resetCursor(node);
    node.addEventListener('mousedown', handleMouseDown);
    node.addEventListener('touchstart', handleTouchStart);
    return () => {
      node.removeEventListener('mousedown', handleMouseDown);
      node.removeEventListener('touchstart', handleTouchStart);
    };
  }, [node]);

  return { ref, node };
};
