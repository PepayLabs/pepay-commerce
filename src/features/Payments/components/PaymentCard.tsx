import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { 
  Heart, 
  MessageSquare, 
  Eye, 
  EyeOff, 
  ExternalLink,
  Instagram,
  Twitter,
  Send,
  Calendar,
  Reply,
  CreditCard,
  Package,
  Repeat,
  MoreHorizontal,
  Copy,
  Loader2,
  Zap,
  Clock,
  DollarSign,
  User,
  Globe,
  Lock,
  AlertCircle
} from 'lucide-react';
import { Invoice } from '../types/payments.types';

interface PaymentCardProps {
  invoice: Invoice;
  onUpdateVisibility: (invoiceId: string, isPublic: boolean) => void;
  onUpdateResponse: (invoiceId: string, responseMessage: string) => void;
}

const getSocialIcon = (platform: string | null) => {
  switch (platform) {
    case 'twitter':
      return <Twitter className="h-4 w-4 text-blue-500" />;
    case 'instagram':
      return <Instagram className="h-4 w-4 text-pink-500" />;
    case 'telegram':
      return <Send className="h-4 w-4 text-blue-400" />;
    case 'tiktok':
      return <div className="h-4 w-4 bg-black rounded-sm flex items-center justify-center text-white text-xs font-bold">T</div>;
    case 'farcaster':
      return <div className="h-4 w-4 bg-purple-600 rounded-sm flex items-center justify-center text-white text-xs font-bold">F</div>;
    default:
      return <Globe className="h-4 w-4 text-gray-500" />;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'donation':
      return <Heart className="h-4 w-4" />;
    case 'subscription':
      return <Repeat className="h-4 w-4" />;
    case 'content':
      return <CreditCard className="h-4 w-4" />;
    case 'package':
      return <Package className="h-4 w-4" />;
    default:
      return <CreditCard className="h-4 w-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'donation':
      return 'text-pink-600 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-400';
    case 'subscription':
      return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400';
    case 'content':
      return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
    case 'package':
      return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400';
    default:
      return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
  }
};

const truncateAddress = (address: string, startLength: number = 6, endLength: number = 4) => {
  if (!address) return '';
  if (address.length <= startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

const formatNetworkName = (network: string | undefined) => {
  if (!network) return '';
  
  switch (network.toLowerCase()) {
    case 'bsc':
    case 'binance':
      return 'BNB';
    case 'ethereum':
      return 'Ethereum';
    case 'solana':
      return 'Solana';
    case 'base':
      return 'Base';
    case 'avax':
    case 'avalanche':
      return 'Avalanche';
    case 'polygon':
      return 'Polygon';
    default:
      return network.charAt(0).toUpperCase() + network.slice(1);
  }
};

const getExplorerUrl = (network: string | null | undefined, txHash: string | undefined) => {
  if (!network || !txHash) return '#';
  
  switch (network.toLowerCase()) {
    case 'ethereum':
      return `https://etherscan.io/tx/${txHash}`;
    case 'bsc':
    case 'binance':
      return `https://bscscan.com/tx/${txHash}`;
    case 'solana':
      return `https://solscan.io/tx/${txHash}`;
    case 'base':
      return `https://basescan.org/tx/${txHash}`;
    case 'avax':
    case 'avalanche':
      return `https://snowtrace.io/tx/${txHash}`;
    default:
      return '#';
  }
};

export const PaymentCard: React.FC<PaymentCardProps> = ({
  invoice,
  onUpdateVisibility,
  onUpdateResponse
}: PaymentCardProps) => {
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState(invoice.response_message || '');
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [updatingVisibility, setUpdatingVisibility] = useState(false);
  const { toast } = useToast();

  const isAnonymous = !invoice.payer_name || invoice.payer_name.trim() === '' || invoice.payer_name === 'Anonymous';
  const socialIcon = getSocialIcon(invoice.social_platform);
  const typeIcon = getTypeIcon(invoice.transaction_type);
  const typeColorClass = getTypeColor(invoice.transaction_type);
  const amount = invoice.amount_usd;

  // Only donations and subscriptions support responses and visibility
  const supportsResponse = invoice.transaction_type === 'donation' || invoice.transaction_type === 'subscription';
  const supportsVisibility = invoice.transaction_type === 'donation' || invoice.transaction_type === 'subscription';

  const handleSubmitResponse = async () => {
    if (!responseMessage.trim()) {
      toast({
        title: "Response required",
        description: "Please enter a response message.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingResponse(true);
    try {
      // Use transaction_id (this is the donation_id/subscription_id)
      await onUpdateResponse(invoice.transaction_id, responseMessage.trim());
      toast({
        title: "Response sent! 💌",
        description: "Your response has been saved and will be visible to the supporter.",
      });
      setResponseDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Failed to send response",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubmittingResponse(false);
    }
  };

  const handleVisibilityToggle = async (isPublic: boolean) => {
    try {
      setUpdatingVisibility(true);
      // Use transaction_id (this is the donation_id/subscription_id)
      await onUpdateVisibility(invoice.transaction_id, isPublic);
      toast({
        title: "Success",
        description: `Payment made ${isPublic ? 'public' : 'private'}`,
      });
    } catch (error) {
      console.error('Error updating visibility:', error);
      toast({
        title: "Error", 
        description: "Failed to update visibility",
        variant: "destructive",
      });
    } finally {
      setUpdatingVisibility(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: `${label} copied! 📋`,
        description: "Successfully copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy • h:mm a');
  };

  // Safely access blockchain data
  const hasBlockchainData = invoice.blockchain_data && Object.keys(invoice.blockchain_data).length > 0;
  const hasTxHash = hasBlockchainData && invoice.blockchain_data?.tx_hash;
  const hasPayerAddress = hasBlockchainData && invoice.blockchain_data?.payer_address;
  const hasSettlementAddress = hasBlockchainData && invoice.blockchain_data?.settlement_address;
  const tokenSymbol = invoice.blockchain_data?.token_symbol;
  const network = invoice.blockchain_data?.network;
  const settlementAddress = invoice.blockchain_data?.settlement_address;

  return (
    <TooltipProvider>
      <Card className="w-full backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-white/90 dark:hover:bg-gray-900/90">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-3">
              {/* Main Info Row */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Type Badge */}
                <Badge className={`text-xs ${typeColorClass} font-medium`}>
                  {typeIcon}
                  <span className="ml-1 capitalize">{invoice.transaction_type}</span>
                </Badge>

                {/* Amount */}
                <Badge className="text-sm font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {amount.toFixed(2)}
                </Badge>

                {/* Blockchain Info */}
                {tokenSymbol && (
                  <Badge variant="outline" className="text-xs">
                    {tokenSymbol}
                  </Badge>
                )}

                {/* Network Badge */}
                {network && (
                  <Badge variant="outline" className="text-xs capitalize">
                    {formatNetworkName(network)}
                  </Badge>
                )}

                {/* Settlement Address Badge with Tooltip */}
                {hasSettlementAddress && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant="outline" 
                        className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 cursor-help hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                        onClick={() => copyToClipboard(settlementAddress!, 'Settlement address')}
                      >
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                          <span>Received at {truncateAddress(settlementAddress!)}</span>
                        </div>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="top" 
                      className="max-w-xs break-all bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs p-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span className="font-mono">{settlementAddress}</span>
                      </div>
                      <div className="text-gray-300 dark:text-gray-600 mt-1">
                        Settlement Address - Click to copy
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Visibility Badge */}
                {supportsVisibility && (
                  <Badge variant={invoice.is_public ? 'default' : 'secondary'} className="text-xs">
                    {invoice.is_public ? (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        Public
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3 mr-1" />
                        Private
                      </>
                    )}
                  </Badge>
                )}
              </div>

              {/* Payer Info */}
              <div className="flex items-center gap-2">
                {socialIcon}
                <span className="font-medium text-gray-900 dark:text-white">
                  {isAnonymous ? 'Anonymous Supporter' : invoice.payer_name}
                </span>
                {invoice.payer_email && !isAnonymous && (
                  <span className="text-xs text-gray-500">• {invoice.payer_email}</span>
                )}
              </div>

              {/* Content Info */}
              {(invoice.content_title || invoice.months_purchased) && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {invoice.content_title && (
                    <span>📄 {invoice.content_title}</span>
                  )}
                  {invoice.months_purchased && (
                    <span>
                      {invoice.content_title && ' • '}
                      ⏰ {invoice.months_purchased} month{invoice.months_purchased !== 1 ? 's' : ''}
                      {invoice.months_remaining && ` (${invoice.months_remaining} remaining)`}
                    </span>
                  )}
                </div>
              )}

              {/* Message */}
              {invoice.transaction_message && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border-l-4 border-blue-500">
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                    "{invoice.transaction_message}"
                  </p>
                </div>
              )}

              {/* Response */}
              {invoice.response_message && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border-l-4 border-green-500">
                  <div className="flex items-center gap-1 mb-1">
                    <Reply className="h-3 w-3 text-green-600" />
                    <span className="text-xs font-medium text-green-600">Your Response</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {invoice.response_message}
                  </p>
                </div>
              )}

              {/* Date */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Received {formatDate(invoice.created_at)}</span>
                </div>
                {invoice.paid_at && invoice.paid_at !== invoice.created_at && (
                  <span>• Paid {formatDate(invoice.paid_at)}</span>
                )}
                {!hasBlockchainData && (
                  <Badge variant="outline" className="text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20">
                    ⚠️ Blockchain data pending
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              {supportsVisibility && (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={invoice.is_public}
                    onCheckedChange={handleVisibilityToggle}
                    disabled={updatingVisibility}
                    className="h-4 w-8"
                  />
                  {updatingVisibility && (
                    <Loader2 className="h-3 w-3 animate-spin text-gray-500" />
                  )}
                </div>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90">
                  {supportsResponse && (
                    <>
                      <DropdownMenuItem onClick={() => setResponseDialogOpen(true)}>
                        <Reply className="h-4 w-4 mr-2" />
                        {invoice.response_message ? 'Edit Response' : 'Send Response'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  {hasTxHash && (
                    <DropdownMenuItem asChild>
                      <a 
                        href={getExplorerUrl(network, invoice.blockchain_data!.tx_hash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Transaction
                      </a>
                    </DropdownMenuItem>
                  )}
                  
                  {hasSettlementAddress && (
                    <DropdownMenuItem 
                      onClick={() => copyToClipboard(settlementAddress!, 'Settlement address')}
                    >
                      <div className="flex items-center">
                        <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Settlement Address
                      </div>
                    </DropdownMenuItem>
                  )}
                  
                  {hasPayerAddress && (
                    <DropdownMenuItem 
                      onClick={() => copyToClipboard(invoice.blockchain_data!.payer_address!, 'Payer address')}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Copy Payer Address
                    </DropdownMenuItem>
                  )}

                  {!hasBlockchainData && (
                    <DropdownMenuItem disabled>
                      <AlertCircle className="h-4 w-4 mr-2 text-yellow-500" />
                      Blockchain data pending
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Response Dialog */}
      {supportsResponse && (
        <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
          <DialogContent className="backdrop-blur-lg bg-white/95 dark:bg-gray-900/95 border border-white/20 max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Reply className="h-5 w-5 text-blue-500" />
                {invoice.response_message ? 'Edit Response' : 'Send Response'}
              </DialogTitle>
              <DialogDescription>
                {isAnonymous ? 'Respond to this anonymous supporter' : `Respond to ${invoice.payer_name}`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="response">Your response</Label>
                <Textarea
                  id="response"
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="Thank you for your support! 🙏"
                  className="mt-1 min-h-[100px]"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {responseMessage.length}/500 characters
                </p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  💡 Your response will be visible to this supporter and may be displayed publicly if this payment is set to public.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setResponseDialogOpen(false)}
                disabled={submittingResponse}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitResponse}
                disabled={submittingResponse || !responseMessage.trim()}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {submittingResponse ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Reply className="h-4 w-4 mr-2" />
                    Send Response
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </TooltipProvider>
  );
}; 