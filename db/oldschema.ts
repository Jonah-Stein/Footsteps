// Have to change how we store trackings.
// Right now plan is to store raw data and then will process it
// every time to see stats.

export const createFootstepsDb = `
CREATE TABLE IF NOT EXISTS trackings(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER NOT NULL,
    lat REAL NOT NULL,
    lon REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS locations(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category_id INTEGER,
    lat REAL,
    lon REAL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
    
CREATE TABLE IF NOT EXISTS categories(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT
);
    
CREATE TABLE IF NOT EXISTS meta(
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
);`;