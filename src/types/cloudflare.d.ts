declare global {
  interface D1ExecResult {
    count: number;
    duration: number;
  }

  interface D1Meta {
    changed_db: boolean;
    changes: number;
    duration: number;
    last_row_id: number;
    rows_read: number;
    rows_written: number;
    served_by: string;
    size_after: number;
  }

  interface D1Result<T = Record<string, unknown>> {
    results?: T[];
    success: boolean;
    meta: D1Meta;
  }

  interface D1PreparedStatement {
    bind(...values: unknown[]): D1PreparedStatement;
    first<T = Record<string, unknown>>(columnName?: string): Promise<T | null>;
    all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
    run<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  }

  interface D1Database {
    exec(query: string): Promise<D1ExecResult>;
    prepare(query: string): D1PreparedStatement;
  }

  interface CloudflareEnv {
    ANTHROPIC_API_KEY: string;
    DB: D1Database;
  }
}

export {};
