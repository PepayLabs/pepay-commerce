import { useState, useEffect, useRef, useCallback } from 'react';

interface DonationCompleteData {
  type: 'donation_complete';
  timestamp: string;
  invoice_id: string;
  amount_usd: number;
  donor_name: string;
  message: string;
  social_platform: string | null;
  creator_name: string;
}




interface WebSocketMessage {
  type: 'connection_established' | 'donation_complete' | 'pong';
  [key: string]: any;
}

export function useDonationWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [donationComplete, setDonationComplete] = useState<DonationCompleteData | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string | null>(null);
  
  const socketRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionParamsRef = useRef<{ invoiceId: string; wsSignature: string } | null>(null);
  const connectionIdRef = useRef<number>(0); // Unique ID for each connection attempt

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
    console.log('🔌 Manually disconnecting WebSocket');
    
    // Increment connection ID to invalidate any pending operations
    connectionIdRef.current += 1;
    
    if (socketRef.current) {
      socketRef.current.close(1000, 'Manual disconnect');
      socketRef.current = null;
    }
    cleanup();
    setConnectionAttempts(0);
    setCurrentInvoiceId(null);
    connectionParamsRef.current = null;
  }, [cleanup]);

  const connectToPayment = useCallback((invoiceId: string, wsSignature: string) => {
    console.log(`🔌 New connection request for invoice: ${invoiceId}`);
    
    // If we're already connected to this invoice, don't reconnect
    if (currentInvoiceId === invoiceId && isConnected && socketRef.current?.readyState === WebSocket.OPEN) {
      console.log('✅ Already connected to this invoice, skipping reconnection');
      return;
    }

    // Increment connection ID to invalidate any pending operations from previous connections
    const thisConnectionId = ++connectionIdRef.current
    // log the connection id
    console.log('🆔 Connection ID:', thisConnectionId);
    
    // Store connection params for this specific connection
    
    connectionParamsRef.current = { invoiceId, wsSignature };
  
    setCurrentInvoiceId(invoiceId);
    
    // Close existing connection if any
    if (socketRef.current) {
      console.log('🔌 Closing previous connection');
      socketRef.current.close(1000, 'New connection requested');
      socketRef.current = null;
    }
    cleanup();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//localhost:3000/ws/donations?invoice_id=${invoiceId}&signature=${wsSignature}`;
    
    console.log('🔌 Connecting to WebSocket:', wsUrl);
    console.log('📋 Invoice ID:', invoiceId);
    console.log('🔐 WS Signature:', wsSignature);
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      // Check if this connection is still valid (not superseded by a newer one)
      if (connectionIdRef.current !== thisConnectionId) {
        console.log('🚫 Connection superseded, closing this connection');
        socket.close(1000, 'Superseded by newer connection');
        return;
      }

      console.log('✅ WebSocket connection established');
      console.log('✅ Socket state:', socket.readyState);
      setIsConnected(true);
      setConnectionAttempts(0);
      
      // Start ping interval to keep connection alive (every 30 seconds)
      pingIntervalRef.current = setInterval(() => {
        // Check if this connection is still valid
        if (connectionIdRef.current !== thisConnectionId) {
          console.log('🚫 Ping interval stopped - connection superseded');
          if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
          }
          return;
        }

        if (socket.readyState === WebSocket.OPEN) {
          console.log('📤 Sending ping');
          socket.send(JSON.stringify({ type: 'ping' }));
        } else {
          console.warn('⚠️ Cannot send ping - socket not open');
          // Try to reconnect if socket is not open and this is still the current connection
          if (connectionParamsRef.current && connectionParamsRef.current.invoiceId === invoiceId) {
            console.log('🔄 Attempting to reconnect due to closed socket');
            connectToPayment(connectionParamsRef.current.invoiceId, connectionParamsRef.current.wsSignature);
          }
        }
      }, 30000);
    };

    socket.onmessage = (event) => {
      // Check if this connection is still valid
      if (connectionIdRef.current !== thisConnectionId) {
        console.log('🚫 Message ignored - connection superseded');
        return;
      }

      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        console.log('📨 WebSocket message received:', data);
        
        if (data.type === 'connection_established') {
          console.log('🎉 Connection established for invoice:', data.invoice_id);
          // Verify this is for the correct invoice
          if (data.invoice_id !== invoiceId) {
            console.warn('⚠️ Received connection established for different invoice:', data.invoice_id, 'expected:', invoiceId);
          }
        } else if (data.type === 'donation_complete') {
          console.log('💰 Donation completed:', data);
          // Verify this is for the correct invoice
          if (data.invoice_id === invoiceId) {
            setDonationComplete(data as DonationCompleteData);
            
            // End connection after successful donation
            console.log('🏁 Donation complete - ending WebSocket connection');
            setTimeout(() => {
              // Only disconnect if this is still the current connection
              if (connectionIdRef.current === thisConnectionId) {
                disconnect();
              }
            }, 2000);
          } else {
            console.warn('⚠️ Received donation complete for different invoice:', data.invoice_id, 'expected:', invoiceId);
          }
          
        } else if (data.type === 'pong') {
          console.log('📥 Received pong - connection alive');
        } else {
          console.log('📨 Unknown message type:', data.type);
        }
      } catch (err) {
        console.error('❌ Error parsing WebSocket message:', err, event.data);
      }
    };

    socket.onclose = (event) => {
      console.log('🔌 WebSocket connection closed:', event.code, event.reason);
      console.log('🔌 Close event details:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
        url: wsUrl,
        timeStamp: event.timeStamp,
        connectionId: thisConnectionId,
        currentConnectionId: connectionIdRef.current
      });
      
      // Only handle close events for the current connection
      if (connectionIdRef.current !== thisConnectionId) {
        console.log('🚫 Close event ignored - connection superseded');
        return;
      }

      setIsConnected(false);
      cleanup();
      
      // Don't retry if:
      // 1. Manual disconnect (code 1000)
      // 2. Donation already completed
      // 3. Max attempts reached
      // 4. Connection superseded
      // 5. Not for current invoice
      const shouldRetry = event.code !== 1000 && 
                         !donationComplete && 
                         connectionAttempts < 5 &&
                         connectionParamsRef.current &&
                         connectionParamsRef.current.invoiceId === invoiceId &&
                         connectionIdRef.current === thisConnectionId;
      
      if (shouldRetry) {
        const retryDelay = Math.min(1000 * Math.pow(2, connectionAttempts), 30000);
        console.log(`🔄 Retrying connection in ${retryDelay}ms (attempt ${connectionAttempts + 1}/5) for connection ${thisConnectionId}`);
        
        retryTimeoutRef.current = setTimeout(() => {
          // Double-check this is still the current connection before retrying
          if (connectionIdRef.current === thisConnectionId && connectionParamsRef.current) {
            setConnectionAttempts(prev => prev + 1);
            connectToPayment(connectionParamsRef.current.invoiceId, connectionParamsRef.current.wsSignature);
          } else {
            console.log('🚫 Retry cancelled - connection superseded');
          }
        }, retryDelay);
      } else {
        console.log('🛑 Not retrying connection:', {
          code: event.code,
          donationComplete: !!donationComplete,
          attempts: connectionAttempts,
          hasParams: !!connectionParamsRef.current,
          connectionId: thisConnectionId,
          currentConnectionId: connectionIdRef.current
        });
      }
    };

    socket.onerror = (error) => {
      // Only handle errors for the current connection
      if (connectionIdRef.current !== thisConnectionId) {
        console.log('🚫 Error ignored - connection superseded');
        return;
      }

      console.error('❌ WebSocket error occurred:');
      console.error('❌ Error event:', error);
      console.error('❌ WebSocket URL that failed:', wsUrl);
      console.error('❌ Socket ready state:', socket.readyState);
      console.error('❌ Connection ID:', thisConnectionId);
      setIsConnected(false);
    };
  }, [connectionAttempts, donationComplete, cleanup, disconnect, isConnected, currentInvoiceId]);

  const resetDonationComplete = useCallback(() => {
    setDonationComplete(null);
  }, []);

  // Handle page visibility change to reconnect when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && 
          connectionParamsRef.current && 
          !isConnected && 
          !donationComplete) {
        console.log('👀 Page visible - checking connection');
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
          console.log('🔄 Reconnecting due to page visibility change');
          connectToPayment(connectionParamsRef.current.invoiceId, connectionParamsRef.current.wsSignature);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isConnected, donationComplete, connectToPayment]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    donationComplete,
    connectionAttempts,
    currentInvoiceId,
    connectToPayment,
    disconnect,
    resetDonationComplete
  };
}