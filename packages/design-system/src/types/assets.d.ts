/** Static asset imports: Vite (Storybook, Vitest) yields a URL string, Next.js yields a StaticImageData object. */
declare module '*.svg' {
  const content: string | { src: string; width?: number; height?: number };
  export default content;
}
