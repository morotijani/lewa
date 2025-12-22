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
const getMerchantId = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const res = yield db_1.default.query(`
            SELECT m.id 
            FROM merchants m 
            JOIN users u ON m.user_id = u.id 
            WHERE u.email = 'merchant@lewa.com'
        `);
        console.log('MERCHANT_ID:', ((_a = res.rows[0]) === null || _a === void 0 ? void 0 : _a.id) || 'Not Found');
    }
    catch (err) {
        console.error(err);
    }
    finally {
        db_1.default.end();
    }
});
getMerchantId();
