import Groq from 'groq-sdk';

export const getGroqClient = (apiKey: string) => {
  return new Groq({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // Necessary for client-side calls as requested
  });
};
