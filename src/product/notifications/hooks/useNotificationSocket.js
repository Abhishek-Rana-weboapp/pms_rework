import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/services/api/queryKeys";
import { getAccessToken } from "@/shared/services/api/authToken";

// TODO(api): confirm the WebSocket path, the auth mechanism (token query param
// vs. cookie), and the message envelope. Defaults below are best guesses.
const WS_PATH = "/ws/notifications/";

// Build the socket URL. In prod we use the current origin; in dev set
// VITE_WS_URL (e.g. ws://110.225.254.51:4040) since Vite isn't proxying WS.
const buildSocketUrl = () => {
  const token = getAccessToken();
  if (!token) return null;

  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  const base = import.meta.env.VITE_WS_URL || `${proto}//${window.location.host}`;
  return `${base.replace(/\/$/, "")}${WS_PATH}?token=${encodeURIComponent(token)}`;
};

// Pull the raw notification row out of whatever envelope the server sends.
const extractNotification = (payload) => {
  if (!payload || typeof payload !== "object") return null;
  if (payload.notification_type) return payload; // already a raw row
  return payload.data ?? payload.notification ?? payload.payload ?? null;
};

const rowId = (n) => n.uuid ?? n.id;

// Opens a live notifications socket and merges pushed rows into the query cache,
// so the drawer / unread badge update in real time. Auto-reconnects with backoff.
export function useNotificationSocket() {
  const queryClient = useQueryClient();
  const retryRef = useRef(0);

  useEffect(() => {
    let socket;
    let reconnectTimer;
    let closed = false;

    const connect = () => {
      const url = buildSocketUrl();
      if (!url) return; // not authenticated yet

      socket = new WebSocket(url);

      socket.onopen = () => {
        retryRef.current = 0;
      };

      socket.onmessage = (event) => {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch {
          return;
        }
        const raw = extractNotification(data);
        if (!raw) return;

        queryClient.setQueryData(queryKeys.notifications.list(), (rows = []) => {
          const id = rowId(raw);
          const exists = rows.some((n) => rowId(n) === id);
          return exists
            ? rows.map((n) => (rowId(n) === id ? raw : n))
            : [raw, ...rows];
        });
      };

      socket.onerror = () => socket.close();

      socket.onclose = () => {
        if (closed) return;
        const delay = Math.min(30000, 1000 * 2 ** retryRef.current); // backoff, capped 30s
        retryRef.current += 1;
        reconnectTimer = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      closed = true;
      clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [queryClient]);
}
