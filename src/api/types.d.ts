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
    created_at: string; // ISO формат дати
    categories: number[]; // Список ID категорій
    amount: number;
    note: string;
  }

  interface Filter {
    createdAt?: { from?: string; to?: string };
    categories?: number[];
  }
}
