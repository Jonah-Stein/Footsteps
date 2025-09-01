import { relations } from 'drizzle-orm';
import { int, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const trackings = sqliteTable('trackings', {
    id: int().primaryKey({autoIncrement: true}),
    timestamp: int().notNull(),
    lat: real().notNull(),
    lon: real().notNull(),
});

export const staypoints = sqliteTable('staypoints', {
    id: int().primaryKey({autoIncrement: true}),
    start_time: int().notNull(),
    end_time: int().notNull(),
    location_id: int().references(()=> locations.id, {onDelete: 'cascade'}),
});

export const staypointsRelations = relations(staypoints, ({one}) => ({
    location: one(locations, {fields: [staypoints.location_id], references: [locations.id]})
}));

// TODO: make list of points and radius
export const locations = sqliteTable('locations', {
    id: int().primaryKey({autoIncrement: true}),
    name: text().notNull(),
    category_id: int().references(()=> categories.id, {onDelete: 'cascade'}),
    lat: real().notNull(),
    lon: real().notNull(),
});

export const locationsRelations = relations(locations, ({one}) => ({
    categories: one(categories, {fields: [locations.category_id], references: [categories.id]})
}));

export const categories = sqliteTable('categories', {
    id: int().primaryKey({autoIncrement: true}),
    name: text().notNull(),
    color: text().notNull()
});