declare global {
  // eslint-disable-next-line no-var
  var __sseClients: Set<ReadableStreamDefaultController> | undefined;
}

export function getClients(): Set<ReadableStreamDefaultController> {
  if (!global.__sseClients) {
    global.__sseClients = new Set();
  }
  return global.__sseClients;
}