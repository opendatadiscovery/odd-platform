declare global {
  namespace NodeJS {
    interface Global {
      worker_id: string;
    }
  }
}

export default global;
