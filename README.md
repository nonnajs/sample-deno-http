# `@nonnajs/sample-deno-http`

Sample Deno HTTP application using Hono HTTP framework and `@nonnajs/di`.

## Dependency Injection At A Glance

`BookController` (`src/book.controller.ts`) is `scope: "request"`, injecting the shared
`BookRepository`/`LoggerService` singletons alongside the per-request `HonoRequestContext` and a
registered config value - all via explicit `@Inject()` tokens:

```ts
@Injectable({scope: "request"})
export class BookController {
    constructor(
        @Inject(BookRepository) private readonly bookRepo: BookRepository,
        @Inject(LoggerService) private readonly logger: LoggerService,
        @Inject(HonoRequestContext) private readonly ctx: HonoRequestContext,
        @Inject(HONO_CONFIG) private readonly config: HonoAppConfig,
    ) {}

    listBooks() {
        this.logger.log(`[${this.ctx.requestId}] Listing books on ${this.config.appName}`);
        return {data: this.bookRepo.findAll(), requestId: this.ctx.requestId};
    }
}
```

`src/app.ts`'s Hono middleware wraps every request in `injector.runInScope()`, then each route
handler resolves the controller fresh from that scope:

```ts
app.use("*", async (c, next) => {
    return injector.runInScope(async () => {
        const ctx = injector.get(HonoRequestContext);
        ctx.method = c.req.method;
        ctx.path = c.req.path;
        await next();
    });
});

app.get("/books", c => {
    const controller = injector.get(BookController);
    return c.json(controller.listBooks());
});
```

## Features Demonstrated

-   **Deno HTTP Server**: Web Standards (Fetch API) based server running on Deno (`Deno.serve`).
-   **Middleware Request-Scoping**: Middleware wrapping each request in `injector.runInScope()`.
-   **Request-Scoped Controllers**: `BookController` and `HonoRequestContext` created per request with isolated state.
-   **Singletons & Lifecycle**: `BookRepository` and `LoggerService` with `OnDestroy` teardown.

## Running the Sample

```sh
# Run server with Deno
deno run --allow-all src/main.ts

# Run tests with Deno
deno test --allow-all test/

# Or run via pnpm in the monorepo
pnpm test
pnpm build
```
