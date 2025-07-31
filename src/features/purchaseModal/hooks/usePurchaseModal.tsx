import { useState } from 'react';
import { ContentItem, ContentAccount } from '../../userContent/types/content.types';

export function usePurchaseModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<ContentAccount | null>(null);

  const openModal = (content: ContentItem, account: ContentAccount) => {
    setSelectedContent(content);
    setSelectedAccount(account);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedContent(null);
    setSelectedAccount(null);
  };

  return {
    isOpen,
    selectedContent,
    selectedAccount,
    openModal,
    closeModal,
  };
}