import { Elysia } from 'elysia';
import { html } from '@elysiajs/html';
import { configs } from 'src/lib/scripts/configs.ts';
import * as path from 'path';
import { nocache } from 'src/lib/service/noCache.ts';

const app = new Elysia()
    .use(nocache)
    .use(html())
    .get('/', async () => {
        const file = Bun.file(configs.outputHtmlPath);
        try {
            return await file.text();
        } catch (e) {
            return 'no html file found';
        }
    })
    .get('/*', async ({ params }) => Bun.file(
        path.join(configs.staticPath, params['*']),
    ))
    .listen(3000);

console.log(
    `🦊 Debug server is running on ${app.server?.hostname}:${app.server?.port}`,
);
