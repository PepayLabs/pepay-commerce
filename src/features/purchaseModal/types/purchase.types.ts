import { ContentItem, ContentAccount } from '../../userContent/types/content.types';

export interface PurchaseModalProps {
  content: ContentItem;
  account: ContentAccount;
  open: boolean;
  onClose: () => void;
  onPurchase?: (content: ContentItem) => void;
  onSignIn?: () => void;
}

export interface ContentPreviewProps {
  content: ContentItem;
  onPreviewClick?: () => void;
  textColor?: string;
  uiBackgroundColor?: string;
  uiBorderColor?: string;
}

export interface CreatorInfoProps {
  account: ContentAccount;
  onCreatorClick?: () => void;
  textColor?: string;
  uiBackgroundColor?: string;
}

export interface PurchaseActionsProps {
  content: ContentItem;
  isAuthenticated: boolean;
  onPurchase?: () => void;
  onSignIn?: () => void;
  textColor?: string;
  loading?: boolean;
}