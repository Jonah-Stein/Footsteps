import { int, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const trackings = sqliteTable('staypoints', {
    id: int().primaryKey({autoIncrement: true}),
    start_time: int().notNull(),
    end_time: int().notNull(),
    location_id: int().references(()=> locations.id, {onDelete: 'cascade'}),
});

export const locations = sqliteTable('locations', {
    id: int().primaryKey({autoIncrement: true}),
    name: text().notNull(),
    category_id: int().references(()=> categories.id, {onDelete: 'cascade'}),
    lat: real().notNull(),
    lon: real().notNull(),
});

export const categories = sqliteTable('categories', {
    id: int().primaryKey({autoIncrement: true}),
    name: text().notNull(),
    color: text().notNull()
});