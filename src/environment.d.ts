declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OBJECT_STORAGE_BUCKET: string;
      OBJECT_STORAGE_USER: string;
      OBJECT_STORAGE_PASSWORD: string;
      OBJECT_STORAGE_HOST: string;
      OBJECT_STORAGE_PORT: string;
      OBJECT_STORAGE_REGION: string;
      OBJECT_STORAGE_SCHEME: string;
      NODE_ENV: "development" | "production";
      PORT?: string;
      DATABASE_URL: string;
      FEATURE_REMOVE_DOCUMENTS_MAX_AGE_IN_DAYS: string;
      FEATURE_REMOVE_DOCUMENTS_TOGGLE: string;
    }
  }
}

export {};
