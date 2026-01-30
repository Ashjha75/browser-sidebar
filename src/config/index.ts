export const config = {
  appwrite: {
    endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    collectionId: import.meta.env.VITE_APPWRITE_COLLECTION_ID,
  },
  extension: {
    name: import.meta.env.VITE_EXTENSION_NAME || 'My Sidebar',
    version: import.meta.env.VITE_EXTENSION_VERSION || '1.0.0',
  },
};
