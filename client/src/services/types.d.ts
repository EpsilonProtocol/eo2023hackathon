export type ApiResponse<T> =
  | {
      status: true;
      data: T;
    }
  | {
      status: false;
      data: {
        message: string;
      };
    };
