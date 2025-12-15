import fs from 'fs';
import path from 'path';
import pool from '../db';

const migrate = async () => {
    try {
        console.log('Starting migration...');
        const schemaPath = path.join(__dirname, '../../db/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        await pool.query(schemaSql);
        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
