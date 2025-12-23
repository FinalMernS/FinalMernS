import { Book } from '../models/Book';
import { Author } from '../models/Author';
import { AppError, ErrorCode, requireAdmin } from '../utils/errors';
import { Context } from '../utils/context';
import { pubsub } from '../utils/pubsub';

export const bookResolvers = {
  Query: {
    books: async (_: unknown, { limit = 50, offset = 0, search }: { limit?: number; offset?: number; search?: string }, context?: Context) => {
      const query: any = { isDeleted: false };
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }
      return Book.find(query)
        .populate('authorId')
        .limit(limit)
        .skip(offset)
        .sort({ createdAt: -1 });
    },
    book: async (_: unknown, { id }: { id: string }) => {
      const book = await Book.findOne({ _id: id, isDeleted: false }).populate('authorId');
      if (!book) {
        throw new AppError('Book not found', ErrorCode.NOT_FOUND);
      }
      return book;
    },
    booksByAuthor: async (_: unknown, { authorId }: { authorId: string }) => {
      return Book.find({ authorId, isDeleted: false }).populate('authorId').sort({ title: 1 });
    },
  },
  Mutation: {
    createBook: async (_: unknown, { input }: { input: any }, context: Context) => {
      requireAdmin(context);

      const author = await Author.findOne({ _id: input.authorId, isDeleted: false });
      if (!author) {
        throw new AppError('Author not found', ErrorCode.NOT_FOUND);
      }

      const existingBook = await Book.findOne({ isbn: input.isbn });
      if (existingBook) {
        throw new AppError('Book with this ISBN already exists', ErrorCode.VALIDATION_ERROR);
      }

      const book = await Book.create({
        title: input.title,
        description: input.description,
        isbn: input.isbn,
        price: input.price,
        stock: input.stock,
        coverImage: input.coverImage,
        publishedDate: input.publishedDate ? new Date(input.publishedDate) : undefined,
        authorId: input.authorId,
      });

      const populatedBook = await Book.findById(book._id).populate('authorId');
      pubsub.publish('BOOK_UPDATED', { bookUpdated: populatedBook });
      return populatedBook;
    },
    updateBook: async (_: unknown, { id, input }: { id: string; input: any }, context: Context) => {
      requireAdmin(context);

      const book = await Book.findOne({ _id: id, isDeleted: false });
      if (!book) {
        throw new AppError('Book not found', ErrorCode.NOT_FOUND);
      }

      if (input.authorId) {
        const author = await Author.findOne({ _id: input.authorId, isDeleted: false });
        if (!author) {
          throw new AppError('Author not found', ErrorCode.NOT_FOUND);
        }
        book.authorId = input.authorId;
      }

      if (input.isbn && input.isbn !== book.isbn) {
        const existingBook = await Book.findOne({ isbn: input.isbn });
        if (existingBook) {
          throw new AppError('Book with this ISBN already exists', ErrorCode.VALIDATION_ERROR);
        }
        book.isbn = input.isbn;
      }

      if (input.title) book.title = input.title;
      if (input.description) book.description = input.description;
      if (input.price !== undefined) book.price = input.price;
      if (input.stock !== undefined) book.stock = input.stock;
      if (input.coverImage !== undefined) book.coverImage = input.coverImage;
      if (input.publishedDate) book.publishedDate = new Date(input.publishedDate);

      await book.save();
      const populatedBook = await Book.findById(book._id).populate('authorId');
      pubsub.publish('BOOK_UPDATED', { bookUpdated: populatedBook });
      return populatedBook;
    },
    deleteBook: async (_: unknown, { id }: { id: string }, context: Context) => {
      requireAdmin(context);

      const book = await Book.findOne({ _id: id, isDeleted: false });
      if (!book) {
        throw new AppError('Book not found', ErrorCode.NOT_FOUND);
      }

      book.isDeleted = true;
      await book.save();
      return true;
    },
  },
  Subscription: {
    bookUpdated: {
      subscribe: () => pubsub.asyncIterator(['BOOK_UPDATED']),
    },
  },
  Book: {
    author: (book: any) => {
      return book.authorId || book.author;
    },
  },
};

