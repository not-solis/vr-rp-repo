import { useCallback, useEffect, useState } from 'react';

export const useDragScroll = () => {
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
        left: node.scrollLeft,
        top: node.scrollTop,
        x: e.clientX,
        y: e.clientY,
      };

      const handleMouseMove = (e: MouseEvent) => {
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
        left: node.scrollLeft,
        top: node.scrollTop,
        x: touch.clientX,
        y: touch.clientY,
      };

      const handleTouchMove = (e: TouchEvent) => {
        const touch = e.touches[0];
        const dx = touch.clientX - startPos.x;
        const dy = touch.clientY - startPos.y;
        node.scrollTop = startPos.top - dy;
        node.scrollLeft = startPos.left - dx;
        updateCursor(node);
      };

      const handleTouchEnd = () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        resetCursor(node);
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
    node.addEventListener('mousedown', handleMouseDown);
    node.addEventListener('touchstart', handleTouchStart);
    return () => {
      node.removeEventListener('mousedown', handleMouseDown);
      node.removeEventListener('touchstart', handleTouchStart);
    };
  }, [node]);

  return { ref };
};
