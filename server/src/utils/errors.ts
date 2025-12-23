import { GraphQLError } from 'graphql';

export enum ErrorCode {
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export class AppError extends GraphQLError {
  constructor(message: string, code: ErrorCode, extensions?: Record<string, unknown>) {
    super(message, {
      extensions: {
        code,
        ...extensions,
      },
    });
  }
}

export const requireAuth = (context: { user?: { userId: string; role: string } }): { userId: string; role: string } => {
  if (!context.user) {
    throw new AppError('Authentication required', ErrorCode.UNAUTHENTICATED);
  }
  return context.user;
};

export const requireAdmin = (context: { user?: { userId: string; role: string } }): { userId: string; role: string } => {
  const user = requireAuth(context);
  if (user.role !== 'ADMIN') {
    throw new AppError('Admin access required', ErrorCode.FORBIDDEN);
  }
  return user;
};


