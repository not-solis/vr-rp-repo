export interface PageData<T, U> {
  hasNext: boolean;
  data: T[];
  nextCursor: U;
}
