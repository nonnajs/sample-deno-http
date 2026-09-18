import {Hono} from "hono";
import {Injector} from "@nonnajs/di";
import {BookController} from "./book.controller";
import {HONO_CONFIG, HonoAppConfig} from "./config";
import {HonoRequestContext} from "./request-context";

export async function createDenoHonoApp(config: HonoAppConfig): Promise<{injector: Injector; app: Hono}> {
    const injector = Injector.create();

    // Register config value
    injector.registerValue(HONO_CONFIG, config);

    // Refresh decorated singletons & request-scoped services
    injector.refresh();

    // Initialize graph
    await injector.initialize();

    const app = new Hono();

    // Middleware: wrap each request in an injector request scope
    app.use("*", async (c, next) => {
        return injector.runInScope(async () => {
            const ctx = injector.get(HonoRequestContext);
            ctx.method = c.req.method;
            ctx.path = c.req.path;

            c.header("X-Request-Id", ctx.requestId);
            await next();
        });
    });

    app.get("/health", c => {
        const ctx = injector.get(HonoRequestContext);
        return c.json({status: "ok", app: config.appName, requestId: ctx.requestId});
    });

    app.get("/books", c => {
        const controller = injector.get(BookController);
        return c.json(controller.listBooks());
    });

    app.get("/books/:id", c => {
        const id = c.req.param("id");
        const controller = injector.get(BookController);
        const result = controller.getBook(id);
        if (!result) {
            const ctx = injector.get(HonoRequestContext);
            return c.json({error: "Book not found", requestId: ctx.requestId}, 404);
        }
        return c.json(result);
    });

    app.post("/books", async c => {
        const body = (await c.req.json()) as {title: string; author: string};
        const controller = injector.get(BookController);
        const result = controller.createBook(body.title, body.author);
        return c.json(result, 201);
    });

    return {injector, app};
}
