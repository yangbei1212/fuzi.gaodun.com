import { useState, useCallback } from 'react';
import { createMessage } from '../utils';
import { MESSAGE_TYPES } from '../constants';

export const useMessages = (initialMessages = []) => {
  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = useCallback((type, content, images = []) => {
    const message = createMessage(type, content, images);
    setMessages(prev => [...prev, message]);
    return message;
  }, []);

  const addUserMessage = useCallback((content, images = []) => {
    return addMessage(MESSAGE_TYPES.USER, content, images);
  }, [addMessage]);

  const addAssistantMessage = useCallback((content, images = []) => {
    return addMessage(MESSAGE_TYPES.ASSISTANT, content, images);
  }, [addMessage]);

  const setLoading = useCallback((loading) => {
    setIsLoading(loading);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    addUserMessage,
    addAssistantMessage,
    setLoading,
    clearMessages
  };
};
