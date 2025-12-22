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
require("dotenv/config");
const db_1 = __importDefault(require("../db"));
const createDemoMerchant = () => __awaiter(void 0, void 0, void 0, function* () {
    // Check if demo user exists
    let userRes = yield db_1.default.query("SELECT id FROM users WHERE email = 'merchant@lewa.com'");
    if (userRes.rows.length === 0) {
        userRes = yield db_1.default.query(`
            INSERT INTO users (phone_number, email, full_name, role)
            VALUES ('0200000001', 'merchant@lewa.com', 'Mama Tess', 'merchant')
            RETURNING id
        `);
    }
    const userId = userRes.rows[0].id;
    // Check if merchant exists
    let merchRes = yield db_1.default.query("SELECT id FROM merchants WHERE user_id = $1", [userId]);
    if (merchRes.rows.length === 0) {
        merchRes = yield db_1.default.query(`
            INSERT INTO merchants (user_id, business_name, address_text)
            VALUES ($1, 'Mama Tess Kitchen', 'Osu, Accra')
            RETURNING id
        `, [userId]);
    }
    console.log('DEMO_MERCHANT_ID:', merchRes.rows[0].id);
    db_1.default.end();
});
createDemoMerchant();
