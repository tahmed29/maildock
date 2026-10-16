export const bucketSchema = `
    CREATE TABLE IF NOT EXISTS buckets (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL CHECK (
            length(trim(name)) BETWEEN 1 AND 60
        ),
        name_key TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL DEFAULT (
            strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        )
    );
`;