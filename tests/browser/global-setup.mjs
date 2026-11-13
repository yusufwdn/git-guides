import { preview } from 'astro';

export default async function setup() {
  const port = Number(process.env.BROWSER_TEST_PORT || 4323);
  const server = await preview({
    server: { host: '127.0.0.1', port },
    logLevel: 'error',
  });
  if (server.port !== port) {
    await server.stop();
    throw new Error(`Port ${port} sudah digunakan. Atur BROWSER_TEST_PORT ke port lain.`);
  }
  return async () => {
    await server.stop();
  };
}
