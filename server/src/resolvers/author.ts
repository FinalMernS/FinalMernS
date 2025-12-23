import { Author } from '../models/Author';
import { AppError, ErrorCode, requireAdmin } from '../utils/errors';
import { Context } from '../utils/context';

export const authorResolvers = {
  Query: {
    authors: async (_: unknown, __: unknown, context?: Context) => {
      return Author.find({ isDeleted: false }).sort({ name: 1 });
    },
    author: async (_: unknown, { id }: { id: string }) => {
      const author = await Author.findOne({ _id: id, isDeleted: false });
      if (!author) {
        throw new AppError('Author not found', ErrorCode.NOT_FOUND);
      }
      return author;
    },
  },
  Mutation: {
    createAuthor: async (_: unknown, { input }: { input: any }, context: Context) => {
      requireAdmin(context);

      const author = await Author.create({
        name: input.name,
        bio: input.bio,
        birthDate: input.birthDate ? new Date(input.birthDate) : undefined,
        nationality: input.nationality,
        photo: input.photo,
      });

      return author;
    },
    updateAuthor: async (_: unknown, { id, input }: { id: string; input: any }, context: Context) => {
      requireAdmin(context);

      const author = await Author.findOne({ _id: id, isDeleted: false });
      if (!author) {
        throw new AppError('Author not found', ErrorCode.NOT_FOUND);
      }

      if (input.name) author.name = input.name;
      if (input.bio !== undefined) author.bio = input.bio;
      if (input.birthDate) author.birthDate = new Date(input.birthDate);
      if (input.nationality !== undefined) author.nationality = input.nationality;
      if (input.photo !== undefined) author.photo = input.photo;

      await author.save();
      return author;
    },
    deleteAuthor: async (_: unknown, { id }: { id: string }, context: Context) => {
      requireAdmin(context);

      const author = await Author.findOne({ _id: id, isDeleted: false });
      if (!author) {
        throw new AppError('Author not found', ErrorCode.NOT_FOUND);
      }

      author.isDeleted = true;
      await author.save();
      return true;
    },
  },
};


