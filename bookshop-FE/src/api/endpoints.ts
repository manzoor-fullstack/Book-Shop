export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    UPDATE_PROFILE: '/auth/update-profile',
    GET_PROFILE: '/auth/me',
    DELETE_ACCOUNT: '/auth/delete-account',
  },
  
  // Book endpoints
  BOOKS: {
    LIST: '/books',
    DETAIL: (id: string | number) => `/books/${id}`,
    CREATE: '/books',
    UPDATE: (id: string | number) => `/books/${id}`,
    DELETE: (id: string | number) => `/books/${id}`,
  },
  
  // Category endpoints
  CATEGORIES: {
    LIST: '/categories',
    CREATE: '/categories',
  },
  
  // Cart endpoints
  CART: {
    GET: '/cart',
    ADD: '/cart/add',
    UPDATE: (id: string | number) => `/cart/${id}`,
    REMOVE: (id: string | number) => `/cart/${id}`,
  },
  
  // Order endpoints
  ORDERS: {
    CREATE: '/orders',
    MY_ORDERS: '/orders/my-orders',
    DETAIL: (id: string | number) => `/orders/${id}`,
    ALL: '/orders',
    UPDATE_STATUS: (id: string | number) => `/orders/${id}/status`,
    INVOICE: (id: string | number) => `/orders/${id}/invoice`,
  },

  // Analytics
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
  },

  // Customers (admin)
  USERS: {
    LIST: '/users',
    DETAIL: (id: string | number) => `/users/${id}`,
    TOGGLE_ACTIVE: (id: string | number) => `/users/${id}/toggle-active`,
    ROLE: (id: string | number) => `/users/${id}/role`,
  },

  // Reviews
  REVIEWS: {
    BY_BOOK: (bookId: string | number) => `/reviews/book/${bookId}`,
    DELETE: (id: string | number) => `/reviews/${id}`,
  },

  // Wishlist
  WISHLIST: {
    GET: '/wishlist',
    ADD: '/wishlist',
    REMOVE: (bookId: string | number) => `/wishlist/${bookId}`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    READ: (id: string | number) => `/notifications/${id}/read`,
    READ_ALL: '/notifications/read-all',
    CLEAR: '/notifications',
  },

  // Settings
  SETTINGS: {
    GET: '/settings',
    UPDATE: '/settings',
  },
} as const;
