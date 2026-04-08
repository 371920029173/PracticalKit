declare module "opencc-js" {
  export const Converter: (opts: { from: string; to: string }) => (s: string) => string;
}
