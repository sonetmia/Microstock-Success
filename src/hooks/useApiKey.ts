import { useState, useEffect } from 'react';

export function useApiKey() {
  const [apiKey, setApiKey] = useState<string | null>(() => {
    return localStorage.getItem('groq_api_key');
  });

  const saveApiKey = (key: string) => {
    localStorage.setItem('groq_api_key', key);
    setApiKey(key);
  };

  const clearApiKey = () => {
    localStorage.removeItem('groq_api_key');
    setApiKey(null);
  };

  return { apiKey, saveApiKey, clearApiKey };
}
