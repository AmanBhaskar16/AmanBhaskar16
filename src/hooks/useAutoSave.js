import { useCallback, useRef, useEffect, useState } from 'react';

const useAutoSave = (saveFunction, delay = 5000, dependencies = []) => {
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const timeoutRef = useRef(null);
  const initialDataRef = useRef(null);

  // Set initial data reference
  const setInitialData = useCallback((data) => {
    initialDataRef.current = data;
    if (data) {
      setLastSaved(new Date());
    }
  }, []);

  // Check if data has changed from initial state
  const hasChanged = useCallback((currentData) => {
    if (!initialDataRef.current) return false;
    
    return JSON.stringify(currentData) !== JSON.stringify(initialDataRef.current);
  }, []);

  // Auto-save function wrapper
  const performAutoSave = useCallback(async (data) => {
    try {
      setIsAutoSaving(true);
      await saveFunction(data);
      setLastSaved(new Date());
      return true;
    } catch (error) {
      console.error('Auto-save failed:', error);
      return false;
    } finally {
      setIsAutoSaving(false);
    }
  }, [saveFunction]);

  // Debounced save function
  const debouncedSave = useCallback((data, shouldSave = true) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only proceed if we should save and data has changed
    if (shouldSave && hasChanged(data)) {
      timeoutRef.current = setTimeout(() => {
        performAutoSave(data);
      }, delay);
    }
  }, [delay, hasChanged, performAutoSave]);

  // Cancel pending auto-save
  const cancelAutoSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isAutoSaving,
    lastSaved,
    debouncedSave,
    cancelAutoSave,
    setInitialData,
    hasChanged,
  };
};

export default useAutoSave;