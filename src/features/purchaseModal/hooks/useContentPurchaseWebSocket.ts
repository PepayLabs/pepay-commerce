import { useState, useEffect, useRef, useCallback } from 'react';

interface ContentPurchasedData {
  type: 'content_purchased';
  timestamp: string;
  invoice_id: string;
  content_id: string;
  content_title: string;
  content_type: string;
  purchase_price: number;
  buyer_name: string;
  payer_address: string;
  creator_name: string;
  access_url: string;
}

interface WebSocketMessage {
  type: 'connection_established' | 'content_purchased' | 'pong';
  [key: string]: any;
}

export function useContentPurchaseWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [contentPurchased, setContentPurchased] = useState<ContentPurchasedData | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string | null>(null);
  
  const socketRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionParamsRef = useRef<{ invoiceId: string; wsSignature: string } | null>(null);
  const connectionIdRef = useRef<number>(0);

  const cleanup = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const disconnect = useCallback(() => {
    console.log('🔌 Manually disconnecting Content Purchase WebSocket');
    
    connectionIdRef.current += 1;
    
    if (socketRef.current) {
      // Close gracefully without logging errors for manual disconnects
      try {
        socketRef.current.close(1000, 'Manual disconnect');
      } catch (err) {
        // Ignore errors on manual disconnect
      }
      socketRef.current = null;
    }
    cleanup();
    setConnectionAttempts(0);
    setCurrentInvoiceId(null);
    connectionParamsRef.current = null;
  }, [cleanup]);

  const connectToPayment = useCallback((invoiceId: string, wsSignature: string) => {
    console.log(`🔌 New content purchase connection request for invoice: ${invoiceId}`);
    
    // Don't connect if already connected to the same invoice
    if (currentInvoiceId === invoiceId && isConnected && socketRef.current?.readyState === WebSocket.OPEN) {
      console.log('✅ Already connected to this content purchase invoice, skipping reconnection');
      return;
    }

    const thisConnectionId = ++connectionIdRef.current;
    console.log('🆔 Content Purchase Connection ID:', thisConnectionId);
    
    connectionParamsRef.current = { invoiceId, wsSignature };
    setCurrentInvoiceId(invoiceId);
    
    // Clean up any existing connection
    if (socketRef.current) {
      console.log('🔌 Closing previous content purchase connection');
      try {
        socketRef.current.close(1000, 'New connection requested');
      } catch (err) {
        // Ignore errors when closing old connections
      }
      socketRef.current = null;
    }
    cleanup();

    // Add a small delay to avoid rapid connection attempts
    setTimeout(() => {
      if (connectionIdRef.current !== thisConnectionId) {
        console.log('🚫 Content purchase connection attempt cancelled - superseded');
        return;
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//localhost:3000/ws/content?invoice_id=${invoiceId}&signature=${wsSignature}`;
      
      console.log('🔌 Connecting to Content Purchase WebSocket:', wsUrl);
      
      try {
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
          if (connectionIdRef.current !== thisConnectionId) {
            console.log('🚫 Content purchase connection superseded, closing this connection');
            socket.close(1000, 'Superseded by newer connection');
            return;
          }

          console.log('✅ Content Purchase WebSocket connection established');
          setIsConnected(true);
          setConnectionAttempts(0);
          
          // Set up ping interval
          pingIntervalRef.current = setInterval(() => {
            if (connectionIdRef.current !== thisConnectionId) {
              if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current);
                pingIntervalRef.current = null;
              }
              return;
            }

            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ type: 'ping' }));
            }
          }, 30000);
        };

        socket.onmessage = (event) => {
          if (connectionIdRef.current !== thisConnectionId) {
            console.log('🚫 Content purchase message ignored - connection superseded');
            return;
          }

          try {
            const data: WebSocketMessage = JSON.parse(event.data);
            console.log('📨 Content Purchase WebSocket message received:', data);
            
            if (data.type === 'connection_established') {
              console.log('🎉 Content purchase connection established for invoice:', data.invoice_id);
              if (data.invoice_id !== invoiceId) {
                console.warn('⚠️ Received content purchase connection established for different invoice:', data.invoice_id, 'expected:', invoiceId);
              }
            } else if (data.type === 'content_purchased') {
              console.log('💰 Content purchased:', data);
              if (data.invoice_id === invoiceId) {
                setContentPurchased(data as ContentPurchasedData);
                
                console.log('🏁 Content purchase complete - ending WebSocket connection');
                setTimeout(() => {
                  if (connectionIdRef.current === thisConnectionId) {
                    disconnect();
                  }
                }, 2000);
              } else {
                console.warn('⚠️ Received content purchased for different invoice:', data.invoice_id, 'expected:', invoiceId);
              }
            } else if (data.type === 'pong') {
              console.log('📥 Received content purchase pong - connection alive');
            } else {
              console.log('📨 Unknown content purchase message type:', data.type);
            }
          } catch (err) {
            console.error('❌ Error parsing Content Purchase WebSocket message:', err, event.data);
          }
        };

        socket.onclose = (event) => {
          console.log('🔌 Content Purchase WebSocket connection closed:', event.code, event.reason);
          
          if (connectionIdRef.current !== thisConnectionId) {
            console.log('🚫 Content purchase close event ignored - connection superseded');
            return;
          }

          setIsConnected(false);
          cleanup();
          
          const shouldRetry = event.code !== 1000 && 
                             !contentPurchased && 
                             connectionAttempts < 5 &&
                             connectionParamsRef.current &&
                             connectionParamsRef.current.invoiceId === invoiceId &&
                             connectionIdRef.current === thisConnectionId;
          
          if (shouldRetry) {
            const retryDelay = Math.min(1000 * Math.pow(2, connectionAttempts), 30000);
            console.log(`🔄 Retrying content purchase connection in ${retryDelay}ms (attempt ${connectionAttempts + 1}/5) for connection ${thisConnectionId}`);
            
            retryTimeoutRef.current = setTimeout(() => {
              if (connectionIdRef.current === thisConnectionId && connectionParamsRef.current) {
                setConnectionAttempts(prev => prev + 1);
                connectToPayment(connectionParamsRef.current.invoiceId, connectionParamsRef.current.wsSignature);
              } else {
                console.log('🚫 Content purchase retry cancelled - connection superseded');
              }
            }, retryDelay);
          } else {
            console.log('🛑 Not retrying content purchase connection:', {
              code: event.code,
              contentPurchased: !!contentPurchased,
              attempts: connectionAttempts,
              hasParams: !!connectionParamsRef.current,
              connectionId: thisConnectionId,
              currentConnectionId: connectionIdRef.current
            });
          }
        };

        socket.onerror = (error) => {
          if (connectionIdRef.current !== thisConnectionId) {
            console.log('🚫 Content purchase error ignored - connection superseded');
            return;
          }

          console.error('❌ Content Purchase WebSocket error occurred:');
          console.error('❌ Error event:', error);
          console.error('❌ WebSocket URL that failed:', wsUrl);
          console.error('❌ Socket ready state:', socket.readyState);
          console.error('❌ Connection ID:', thisConnectionId);
          setIsConnected(false);
        };
      } catch (err) {
        console.error('❌ Failed to create WebSocket connection:', err);
        setIsConnected(false);
      }
    }, 500); // 500ms delay to prevent rapid connections
  }, [connectionAttempts, contentPurchased, cleanup, isConnected, currentInvoiceId]);

  const resetContentPurchased = useCallback(() => {
    setContentPurchased(null);
  }, []);

  // Handle page visibility change to reconnect when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && 
          connectionParamsRef.current && 
          !isConnected && 
          !contentPurchased) {
        console.log('👀 Page visible - checking content purchase connection');
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
          console.log('🔄 Reconnecting content purchase due to page visibility change');
          connectToPayment(connectionParamsRef.current.invoiceId, connectionParamsRef.current.wsSignature);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isConnected, contentPurchased, connectToPayment]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    contentPurchased,
    connectionAttempts,
    currentInvoiceId,
    connectToPayment,
    disconnect,
    resetContentPurchased
  };
}