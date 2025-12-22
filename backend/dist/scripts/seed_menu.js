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
const seedMenu = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // 1. Get Merchant ID
    const merchRes = yield db_1.default.query(`
        SELECT m.id 
        FROM merchants m 
        JOIN users u ON m.user_id = u.id 
        WHERE u.email = 'merchant@lewa.com'
    `);
    const merchantId = (_a = merchRes.rows[0]) === null || _a === void 0 ? void 0 : _a.id;
    if (!merchantId) {
        console.error('Merchant not found! Run create_merchant.ts first.');
        return;
    }
    console.log('Seeding for Merchant ID:', merchantId);
    // 2. Insert Items
    const items = [
        { name: 'Jollof Rice & Chicken', price: 45.00, category: 'Main', description: 'Spicy jollof with grilled chicken' },
        { name: 'Fried Rice & Beef', price: 50.00, category: 'Main', description: 'Wok fried rice with tender beef chunks' },
        { name: 'Banku & Tilapia', price: 60.00, category: 'Main', description: 'Fresh Tilapia with hot pepper' },
        { name: 'Coca Cola', price: 10.00, category: 'Drinks', description: 'Chilled 500ml bottle' },
        { name: 'Kelewele', price: 15.00, category: 'Sides', description: 'Spicy fried plantain cubes' }
    ];
    for (const item of items) {
        yield db_1.default.query(`
            INSERT INTO menu_items (merchant_id, name, price, category, description)
            VALUES ($1, $2, $3, $4, $5)
        `, [merchantId, item.name, item.price, item.category, item.description]);
    }
    console.log('✅ Menu seeded with 5 items.');
    db_1.default.end();
});
seedMenu();
