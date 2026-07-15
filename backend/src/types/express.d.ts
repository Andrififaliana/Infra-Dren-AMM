// Global Express namespace for @types/multer compatibility with @types/express v5
// @types/express v5 removed the global `Express` namespace, so @types/multer's
// `declare global { namespace Express { namespace Multer { interface File {...} } } }`
// augmentation cannot attach. This restores the global namespace for it to augment.

declare global {
  namespace Express {
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        stream: NodeJS.ReadableStream;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      }
    }
  }
}

export {};
