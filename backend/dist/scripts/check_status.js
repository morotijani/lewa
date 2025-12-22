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
const db_1 = __importDefault(require("../db"));
function checkCourierStatus() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield db_1.default.query(`
      SELECT 
        u.id as user_id, 
        u.full_name, 
        u.is_verified, 
        u.role,
        c.id as courier_id, 
        c.is_online, 
        c.vehicle_type, 
        c.current_lat, 
        c.current_lng
      FROM users u
      LEFT JOIN couriers c ON u.id = c.user_id
      WHERE u.role = 'courier'
    `);
            console.log('Couriers Status:', JSON.stringify(res.rows, null, 2));
        }
        catch (err) {
            console.error(err);
        }
        finally {
            db_1.default.end();
        }
    });
}
checkCourierStatus();
