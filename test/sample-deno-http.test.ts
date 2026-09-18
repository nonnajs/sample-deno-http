import assert from "node:assert/strict";
import {describe, it} from "node:test";

import {createDenoHonoApp} from "../src/app";
import {LoggerService} from "../src/logger.service";

describe("Sample Deno HTTP App - @nonnajs/di", () => {
    it("handles GET /health and returns X-Request-Id header", async () => {
        const {injector, app} = await createDenoHonoApp({
            port: 3000,
            appName: "TestDenoHono",
            environment: "test",
        });

        const res = await app.request("/health");
        assert.equal(res.status, 200);

        const data = (await res.json()) as {status: string; app: string; requestId: string};
        assert.equal(data.status, "ok");
        assert.equal(data.app, "TestDenoHono");
        assert.ok(res.headers.get("x-request-id"));
        assert.equal(data.requestId, res.headers.get("x-request-id"));

        await injector.destroy();
    });

    it("handles GET /books and POST /books via request-scoped controller", async () => {
        const {injector, app} = await createDenoHonoApp({
            port: 3000,
            appName: "TestDenoHono",
            environment: "test",
        });

        // Initial list
        const listRes = await app.request("/books");
        assert.equal(listRes.status, 200);
        const listData = (await listRes.json()) as {data: Array<{id: string; title: string}>};
        assert.equal(listData.data.length, 2);

        // Create new book
        const createRes = await app.request("/books", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({title: "Refactoring", author: "Martin Fowler"}),
        });
        assert.equal(createRes.status, 201);
        const createdData = (await createRes.json()) as {data: {id: string; title: string}};
        assert.equal(createdData.data.title, "Refactoring");
        const newId = createdData.data.id;

        // Fetch by ID
        const getRes = await app.request(`/books/${newId}`);
        assert.equal(getRes.status, 200);
        const getData = (await getRes.json()) as {data: {id: string; title: string}};
        assert.equal(getData.data.title, "Refactoring");

        // 404 for missing
        const missingRes = await app.request("/books/nonexistent");
        assert.equal(missingRes.status, 404);

        await injector.destroy();
    });

    it("isolates request-scoped context across concurrent requests", async () => {
        const {injector, app} = await createDenoHonoApp({
            port: 3000,
            appName: "TestDenoHono",
            environment: "test",
        });

        const [res1, res2] = await Promise.all([app.request("/health"), app.request("/health")]);

        const id1 = res1.headers.get("x-request-id");
        const id2 = res2.headers.get("x-request-id");
        assert.ok(id1 && id2);
        assert.notEqual(id1, id2, "Request IDs must be distinct across concurrent requests");

        await injector.destroy();
    });

    it("invokes onDestroy on singletons during container teardown", async () => {
        const {injector, app} = await createDenoHonoApp({
            port: 3000,
            appName: "TestDenoHono",
            environment: "test",
        });

        await app.request("/health");
        const logger = injector.get(LoggerService);
        assert.equal(logger.isDestroyed, false);

        await injector.destroy();
        assert.equal(logger.isDestroyed, true);
        assert.ok(logger.logs.some((l: string) => l.includes("LoggerService destroyed")));
    });
});
