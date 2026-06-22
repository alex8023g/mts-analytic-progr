const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://127.0.0.1:8000';

export type JobEvent =
  | { type: 'status'; stage: string }
  | { type: 'progress'; processed: number; total: number }
  | ({ type: 'result' } & Record<string, unknown>)
  | { type: 'error'; detail: string };

export type JobProgressHandlers = {
  onProgress?: (processed: number, total: number) => void;
  onEvent?: (event: JobEvent) => void;
};

export function openJobSocket(
  channel: 'imports' | 'exports',
  jobId: string,
  handlers: JobProgressHandlers,
): Promise<WebSocket | null> {
  return new Promise((resolve) => {
    let settled = false;
    const settle = (value: WebSocket | null) => {
      if (!settled) {
        settled = true;
        resolve(value);
      }
    };

    const socket = new WebSocket(`${WS_URL}/ws/${channel}/${jobId}`);

    socket.onopen = () => settle(socket);

    socket.onmessage = (event) => {
      let parsed: JobEvent;
      try {
        parsed = JSON.parse(event.data);
      } catch {
        return;
      }
      handlers.onEvent?.(parsed);
      if (parsed.type === 'progress') {
        handlers.onProgress?.(parsed.processed, parsed.total);
      }
    };

    socket.onerror = () => settle(null);
  });
}
