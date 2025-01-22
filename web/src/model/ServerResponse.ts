export interface ResponseData<T> {
  success: boolean;
  errors?: string[];
  data?: T;
}
