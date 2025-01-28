export interface PageData<T> {
  hasNext: boolean;
  data: T[];
  nextCursor: number;
}
