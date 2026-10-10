export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const isNotFoundError = (e: unknown): e is ApiError =>
  e instanceof ApiError && e.status === 404;

