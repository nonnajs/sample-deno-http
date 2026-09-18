import {createDenoHonoApp} from "./app";

async function main() {
    const port = 3000;
    const {app} = await createDenoHonoApp({
        port,
        appName: "NodeBoot-Deno-Hono-Sample",
        environment: "production",
    });

    console.info(`Starting Deno + Hono server on port ${port}...`);

    if (typeof (globalThis as any).Deno !== "undefined" && (globalThis as any).Deno.serve) {
        (globalThis as any).Deno.serve({port}, app.fetch);
    } else {
        console.info("Hono app initialized successfully.");
    }
}

if (typeof require !== "undefined" && require.main === module) {
    main().catch(console.error);
} else if (typeof (globalThis as any).Deno !== "undefined") {
    main().catch(console.error);
}
