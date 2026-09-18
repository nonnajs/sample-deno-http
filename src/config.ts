export const HONO_CONFIG = Symbol("HONO_CONFIG");

export interface HonoAppConfig {
    port: number;
    appName: string;
    environment: string;
}
