import {Inject, Injectable} from "@nonnajs/di";
import {BookRepository, type Book} from "./book.repository";
import {HONO_CONFIG, type HonoAppConfig} from "./config";
import {LoggerService} from "./logger.service";
import {HonoRequestContext} from "./request-context";

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
        return {
            data: this.bookRepo.findAll(),
            requestId: this.ctx.requestId,
        };
    }

    getBook(id: string) {
        this.logger.log(`[${this.ctx.requestId}] Fetching book id=${id}`);
        const book = this.bookRepo.findById(id);
        if (!book) return null;
        return {
            data: book,
            requestId: this.ctx.requestId,
        };
    }

    createBook(title: string, author: string): {data: Book; requestId: string} {
        const id = `b-${Date.now()}`;
        const book = this.bookRepo.save({id, title, author});
        this.logger.log(`[${this.ctx.requestId}] Created book id=${id}`);
        return {
            data: book,
            requestId: this.ctx.requestId,
        };
    }
}
