const API_BASE_URL = 'http://localhost:8000'; // Your FastAPI backend
const WS_URL = 'ws://localhost:8080'; // Your WebSocket server

export const API_ENDPOINTS = {
  login: `${API_BASE_URL}/token`,
  
  admin: {
    users: `${API_BASE_URL}/admin/users`,
    userById: (userId: string) => `${API_BASE_URL}/admin/users/${userId}`,
  },

  notebooks: {
    // We'll need to create these endpoints in FastAPI next
    list: `${API_BASE_URL}/notebooks`,
    create: `${API_BASE_URL}/notebooks`,
    byId: (notebookId: string) => `${API_BASE_URL}/notebooks/${notebookId}`,
    update: (notebookId: string) => `${API_BASE_URL}/notebooks/${notebookId}`,
  },
  
  execution: {
    websocket: WS_URL,
  },
};