declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      SESSION_SECRET: string;
    }
  }
}

export {}
