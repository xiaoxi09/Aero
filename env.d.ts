interface CloudflareEnv {
  KVIDEO_KV: KVNamespace;
}

declare module '@cloudflare/next-on-pages' {
  interface RequestContext {
    env: CloudflareEnv;
  }
}
