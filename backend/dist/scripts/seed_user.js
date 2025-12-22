"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load .env from backend root (one level up from src/scripts)
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const pool = new pg_1.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});
function seed() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const phone = '0245550123';
            const password = 'password123';
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
            const fullName = 'Demo User';
            // Check if user exists
            const res = yield pool.query('SELECT * FROM users WHERE phone_number = $1', [phone]);
            if (res.rows.length > 0) {
                console.log('User already exists');
                console.log('Phone:', phone);
                console.log('Password:', password);
                return;
            }
            // Insert user
            yield pool.query('INSERT INTO users (full_name, phone_number, password_hash, role) VALUES ($1, $2, $3, $4)', [fullName, phone, hashedPassword, 'customer']);
            console.log('Seed successful');
            console.log('Phone:', phone);
            console.log('Password:', password);
        }
        catch (err) {
            console.error('Seed failed', err);
        }
        finally {
            pool.end();
        }
    });
}
seed();
