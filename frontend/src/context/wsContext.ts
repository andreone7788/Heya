import { createContext, useContext } from 'react';
import { WebSocketContextType } from '../types/socket.types';
import { useTranslation } from 'react-i18next';

export const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  const {t} = useTranslation()
  if (!context) {
    throw new Error(t('context.error'));
  }
  return context;
};