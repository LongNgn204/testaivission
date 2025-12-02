import React from 'react';
import { Chatbot } from '../components/Chatbot';
import { useLanguage } from '../context/LanguageContext';

const ChatPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-2 text-gray-800 dark:text-gray-200">{t('chat_with_eva')}</h1>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-8">{t('chat_subtitle')}</p>
      <Chatbot />
    </div>
  );
};

export default ChatPage;

