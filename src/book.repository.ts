import {Injectable} from "@nonnajs/di";

export interface Book {
    id: string;
    title: string;
    author: string;
}

@Injectable()
export class BookRepository {
    private readonly books = new Map<string, Book>([
        ["b1", {id: "b1", title: "Designing Data-Intensive Applications", author: "Martin Kleppmann"}],
        ["b2", {id: "b2", title: "Clean Architecture", author: "Robert C. Martin"}],
    ]);

    findAll(): Book[] {
        return [...this.books.values()];
    }

    findById(id: string): Book | undefined {
        return this.books.get(id);
    }

    save(book: Book): Book {
        this.books.set(book.id, book);
        return book;
    }
}
