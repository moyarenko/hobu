declare module Category {
  interface Item {
    id: number;
    name: string;
    color: string;
  }
}

declare module Order {
  interface Item {
    id: number;
    created_at: number; // timestamp
    category_id: number; // ID категорії
    amount: number;
    note: string;
    type: Type;
  }

  interface Filter {
    createdAt?: { from?: string; to?: string };
    categories?: number[];
  }

  type Type = 'debit' | 'credit';
}
