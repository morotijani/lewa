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
exports.MerchantService = void 0;
const db_1 = __importDefault(require("../db"));
exports.MerchantService = {
    // --- Menu Management ---
    getMenu(merchantId) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield db_1.default.query('SELECT * FROM menu_items WHERE merchant_id = $1 ORDER BY category, name', [merchantId]);
            return res.rows;
        });
    },
    addMenuItem(merchantId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield db_1.default.query(`INSERT INTO menu_items (merchant_id, name, price, category, description)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`, [merchantId, data.name, data.price, data.category, data.description]);
            return res.rows[0];
        });
    },
    updateMenuItem(itemId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = 'UPDATE menu_items SET updated_at = NOW()';
            const params = [];
            let paramIdx = 1;
            if (data.name !== undefined) {
                query += `, name = $${paramIdx++}`;
                params.push(data.name);
            }
            if (data.price !== undefined) {
                query += `, price = $${paramIdx++}`;
                params.push(data.price);
            }
            if (data.category !== undefined) {
                query += `, category = $${paramIdx++}`;
                params.push(data.category);
            }
            if (data.description !== undefined) {
                query += `, description = $${paramIdx++}`;
                params.push(data.description);
            }
            if (data.isAvailable !== undefined) {
                query += `, is_available = $${paramIdx++}`;
                params.push(data.isAvailable);
            }
            query += ` WHERE id = $${paramIdx} RETURNING *`;
            params.push(itemId);
            const res = yield db_1.default.query(query, params);
            return res.rows[0];
        });
    },
    deleteMenuItem(itemId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_1.default.query('DELETE FROM menu_items WHERE id = $1', [itemId]);
            return { success: true };
        });
    },
    // --- Order Management ---
    // For Demo: Fetch ALL orders that are seemingly for a restaurant (not P2P) or just latest orders
    // Ideally we filter by merchant_id, but for MVP we will return latest 20 orders
    getMerchantOrders(merchantId) {
        return __awaiter(this, void 0, void 0, function* () {
            // If we had merchant_id on orders:
            // 'SELECT * FROM orders WHERE merchant_id = $1 ...'
            // For now, let's just return recent orders so the dashboard looks alive
            const res = yield db_1.default.query(`
            SELECT o.*, u.full_name as customer_name,
            -- Mock items for now since we store details in JSON or unrelated table?
            -- Actually we should store items in a order_items table or JSONB
            -- Let's return the whole order object
            o.notes
            FROM orders o
            JOIN users u ON o.customer_id = u.id
            ORDER BY o.created_at DESC
            LIMIT 20
        `);
            return res.rows;
        });
    }
};
