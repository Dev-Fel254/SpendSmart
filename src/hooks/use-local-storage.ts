import { useState, useEffect, useCallback } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false); // Track if initial read is done

  // Effect to read from localStorage only on the client-side after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem(key);
        if (item !== null) {
          setStoredValue(JSON.parse(item));
        } else {
            // If no item found, set the initial value in localStorage
            window.localStorage.setItem(key, JSON.stringify(initialValue));
            setStoredValue(initialValue); // Ensure state matches initial value if nothing was stored
        }
      } catch (error) {
        console.error(`Error reading localStorage key “${key}”:`, error);
        setStoredValue(initialValue); // Fallback to initial value on error
      } finally {
          setIsInitialized(true); // Mark initialization complete
      }
    }
      // We don't include initialValue in deps intentionally,
      // it should only be used on the very first initialization if nothing exists in storage.
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Effect to update state if localStorage changes in another tab/window
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(JSON.parse(event.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage key “${key}” on storage event:`, error);
        }
      } else if (event.key === key && event.newValue === null) {
          // Handle item removal in another tab
          setStoredValue(initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
      if (typeof window === 'undefined') {
          console.warn(`Tried setting localStorage key “${key}” from server-side.`);
          return;
      }
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key, storedValue]);

  // Return the initial value until the client-side effect has run
  return [isInitialized ? storedValue : initialValue, setValue];
}

export default useLocalStorage;
