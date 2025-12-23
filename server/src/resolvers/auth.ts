import { User } from '../models/User';
import { generateToken } from '../utils/auth';
import { AppError, ErrorCode } from '../utils/errors';
import { Context } from '../utils/context';

export const authResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: Context) => {
      if (!context.user) {
        return null;
      }
      const user = await User.findById(context.user.userId);
      return user;
    },
    users: async (_: unknown, __: unknown, context: Context) => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new AppError('Admin access required', ErrorCode.FORBIDDEN);
      }
      return User.find();
    },
    user: async (_: unknown, { id }: { id: string }, context: Context) => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new AppError('Admin access required', ErrorCode.FORBIDDEN);
      }
      const user = await User.findById(id);
      if (!user) {
        throw new AppError('User not found', ErrorCode.NOT_FOUND);
      }
      return user;
    },
  },
  Mutation: {
    login: async (_: unknown, { input }: { input: { email: string; password: string } }, context?: Context) => {
      const user = await User.findOne({ email: input.email.toLowerCase() }).select('+password');
      if (!user) {
        throw new AppError('Invalid email or password', ErrorCode.UNAUTHENTICATED);
      }

      const isPasswordValid = await user.comparePassword(input.password);
      if (!isPasswordValid) {
        throw new AppError('Invalid email or password', ErrorCode.UNAUTHENTICATED);
      }

      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      return {
        token,
        user,
      };
    },
    register: async (_: unknown, { input }: { input: { email: string; password: string; name: string } }, context?: Context) => {
      const existingUser = await User.findOne({ email: input.email.toLowerCase() });
      if (existingUser) {
        throw new AppError('User with this email already exists', ErrorCode.VALIDATION_ERROR);
      }

      const user = await User.create({
        email: input.email.toLowerCase(),
        password: input.password,
        name: input.name,
        role: 'USER',
      });

      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      return {
        token,
        user,
      };
    },
  },
};


