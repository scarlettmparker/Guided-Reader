declare global {
  interface Window {
    update_response_timeout: NodeJS.Timeout | undefined;
  }
}

export {};