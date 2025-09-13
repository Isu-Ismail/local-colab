// This file will be the single source of truth for all backend endpoints.

// Use environment variables for flexibility between development and production
// Your colleague can run the frontend with a different backend just by changing these.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';

export const API_ENDPOINTS = {
  // We use NextAuth's built-in URLs, but if your colleague has a custom login:
  login: `${API_BASE_URL}/auth/your-custom-login`, // Example placeholder
  
  notebooks: {
    save: `${API_BASE_URL}/notebooks/save`,
    load: (notebookId: string) => `${API_BASE_URL}/notebooks/${notebookId}`,
  },
  
  execution: {
    websocket: WS_URL,
  },
};