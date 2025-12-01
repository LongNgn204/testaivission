/**
 * AI Service Context
 * 
 * Provides a singleton instance of AIService to the entire application.
 * This prevents multiple instances of the AI client from being created,
 * optimizing resource usage and preventing potential race conditions with TTS.
 */
import React, { createContext } from 'react';
import { AIService } from '../services/aiService';

// Create a single, shared instance of the AI service
const aiServiceInstance = new AIService();

// Create the context with the service instance as the default value
const AIContext = createContext<AIService>(aiServiceInstance);

// Custom "hook" for easy access to the AI service.
// Trả về singleton trực tiếp, KHÔNG gọi React hooks bên trong để tránh Invalid hook call.
export const useAI = (): AIService => {
  return aiServiceInstance;
};

// Provider component to wrap the application
export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AIContext.Provider value={aiServiceInstance}>
      {children}
    </AIContext.Provider>
  );
};

