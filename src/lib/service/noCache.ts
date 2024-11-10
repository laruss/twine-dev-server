import type { Elysia } from 'elysia';

export const nocache = (app: Elysia) => {
    // was taken from https://github.com/gaurishhs/elysia-nocache
    return app.onRequest(({ set }) => {
        console.log('no cache');
        set.headers['Surrogate-Control'] = 'no-store';
        set.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate';
        // Deprecated though https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Pragma
        set.headers['Pragma'] = 'no-cache';
        set.headers['Expires'] = '0';
    });
};
