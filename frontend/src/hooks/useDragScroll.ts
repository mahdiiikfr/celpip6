import { useRef, useState, useCallback } from 'react';

export function useDragScroll<T extends HTMLElement>() {
    const scrollRef = useRef<T>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const isDragIntentRef = useRef(false);

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        isDragIntentRef.current = false;
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    }, []);

    const onMouseLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const onMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const onMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;

        // Only consider it a drag if moved more than 5px to avoid preventing normal clicks
        if (Math.abs(x - startX) > 5) {
            isDragIntentRef.current = true;
        }

        const walk = (x - startX) * 2; // Scroll speed
        scrollRef.current.scrollLeft = scrollLeft - walk;
    }, [isDragging, startX, scrollLeft]);

    return {
        scrollRef,
        isDragging,
        isDragIntent: () => isDragIntentRef.current,
        events: {
            onMouseDown,
            onMouseLeave,
            onMouseUp,
            onMouseMove,
        },
    };
}
