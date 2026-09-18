import {Injectable} from "@nonnajs/di";

@Injectable({scope: "request"})
export class HonoRequestContext {
    public requestId: string = `hono-req-${Math.random().toString(36).substring(2, 9)}`;
    public startTime: number = Date.now();
    public method: string = "GET";
    public path: string = "/";
}
