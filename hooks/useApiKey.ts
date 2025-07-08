
import { useState, useEffect, useMemo, useCallback } from 'react';

const API_KEY_STORAGE_KEY = 'gemini-api-key';

export const useApiKey = () => {
  const [userApiKey, setUserApiKey] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedKey) {
      setUserApiKey(storedKey);
    }
    setIsMounted(true);
  }, []);

  const isEnvKey = useMemo(() => !!process.env.API_KEY, []);

  const apiKey = useMemo(() => {
    return isEnvKey ? process.env.API_KEY : userApiKey;
  }, [isEnvKey, userApiKey]);

  const isKeyAvailable = useMemo(() => !!apiKey, [apiKey]);

  const saveUserApiKey = useCallback((key: string) => {
    const trimmedKey = key.trim();
    if (trimmedKey) {
      localStorage.setItem(API_KEY_STORAGE_KEY, trimmedKey);
      setUserApiKey(trimmedKey);
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
      setUserApiKey(null);
    }
  }, []);

  return { apiKey, isKeyAvailable, isEnvKey, userApiKey, saveUserApiKey, isMounted };
};
