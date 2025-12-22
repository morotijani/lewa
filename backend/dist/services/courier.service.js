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
exports.CourierService = void 0;
const db_1 = __importDefault(require("../db"));
exports.CourierService = {
    // Update online status and location
    updateStatus(userId, isOnline, lat, lng) {
        return __awaiter(this, void 0, void 0, function* () {
            // First get courier_id from user_id
            const courierRes = yield db_1.default.query('SELECT id FROM couriers WHERE user_id = $1', [userId]);
            const courier = courierRes.rows[0];
            if (!courier) {
                throw new Error('Courier profile not found for this user');
            }
            // Dynamic update query
            let query = 'UPDATE couriers SET is_online = $1, last_location_update = NOW()';
            const params = [isOnline];
            let paramIdx = 2;
            if (lat !== undefined && lng !== undefined) {
                query += `, current_lat = $${paramIdx++}, current_lng = $${paramIdx++}`;
                params.push(lat, lng);
            }
            query += ` WHERE id = $${paramIdx} RETURNING *`;
            params.push(courier.id);
            const result = yield db_1.default.query(query, params);
            return result.rows[0];
        });
    },
    // Get courier profile
    getProfile(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.default.query(`
      SELECT c.*, u.full_name, u.phone_number, u.email 
      FROM couriers c
      JOIN users u ON c.user_id = u.id
      WHERE c.user_id = $1
    `, [userId]);
            return result.rows[0];
        });
    },
    // Create courier profile (if not exists) - usually done at registration or separate onboarding
    createProfile(userId, vehicleType, licensePlate) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.default.query(`
      INSERT INTO couriers (user_id, vehicle_type, license_plate)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [userId, vehicleType, licensePlate]);
            return result.rows[0];
        });
    },
    // Update courier profile
    updateProfile(userId, vehicleType, licensePlate) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.default.query(`
      UPDATE couriers 
      SET vehicle_type = $2, license_plate = $3
      WHERE user_id = $1
      RETURNING *
    `, [userId, vehicleType, licensePlate]);
            if (result.rowCount === 0) {
                throw new Error('Courier profile not found');
            }
            return result.rows[0];
        });
    }
};
