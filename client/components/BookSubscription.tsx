'use client';

import { useEffect } from 'react';
import { useSubscription, gql } from '@apollo/client';

const BOOK_UPDATED_SUBSCRIPTION = gql`
  subscription BookUpdated {
    bookUpdated {
      id
      title
      description
      price
      stock
      coverImage
      author {
        id
        name
      }
    }
  }
`;

export function BookSubscription({ onBookUpdate }: { onBookUpdate: (book: any) => void }) {
  const { data, error } = useSubscription(BOOK_UPDATED_SUBSCRIPTION);

  useEffect(() => {
    if (data?.bookUpdated) {
      onBookUpdate(data.bookUpdated);
    }
  }, [data, onBookUpdate]);

  if (error) {
    console.error('Subscription error:', error);
    return null;
  }

  return null;
}


