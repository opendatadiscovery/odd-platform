declare global {
  namespace NodeJS {
    interface Global {
      workerId: string;
    }
  }
}

export default global;
