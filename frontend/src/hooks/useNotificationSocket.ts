import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/queriesAndMutations';

export function useNotificationSocket(userId: string) {
  const queryClient = useQueryClient();
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('myiu_token');
    if (!token || !userId) return;

    const client = new Client({
      // VITE_WS_URL is for the WebSocket/SockJS base — defaults to VITE_API_URL (SockJS uses HTTP transport)
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL || 'http://localhost:8080'}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/user/queue/notifications', () => {
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_NOTIFICATIONS, userId] });
        });
      },
      onStompError: () => {
        // silent — REST polling at 5min is the fallback
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [userId, queryClient]);
}
