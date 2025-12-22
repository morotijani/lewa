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
const db_1 = __importDefault(require("./db"));
const dispatch_service_1 = require("./services/dispatch.service");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const debugDispatch = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const phone = '0545222222'; // Replace with the courier's phone number you are testing with
        console.log(`--- DEBUGGING COURIER: ${phone} ---`);
        // 1. Check User & Courier Status
        const userRes = yield db_1.default.query('SELECT * FROM users WHERE phone_number = $1', [phone]);
        const user = userRes.rows[0];
        if (!user) {
            console.error('User not found!');
            return;
        }
        console.log('User Found:', { id: user.id, name: user.full_name, role: user.role, is_verified: user.is_verified });
        const courierRes = yield db_1.default.query('SELECT * FROM couriers WHERE user_id = $1', [user.id]);
        const courier = courierRes.rows[0];
        if (!courier) {
            console.error('Courier profile not found!');
            return;
        }
        console.log('Courier Profile:', {
            vehicle: courier.vehicle_type,
            plate: courier.license_plate,
            is_online: courier.is_online,
            lat: courier.current_lat,
            lng: courier.current_lng
        });
        // 2. Force Online & Location (if needed)
        // Uncomment to force update
        /*
        await pool.query(`
            UPDATE couriers SET is_online = TRUE, current_lat = 5.6508, current_lng = -0.1870
            WHERE user_id = $1
        `, [user.id]);
        console.log('Forced Courier Online at Test Location (Legon)');
        */
        // 3. Test Find Nearest Logic
        console.log('\n--- TESTING DISPATCH LOGIC ---');
        const pickupLat = 5.6508; // Legon
        const pickupLng = -0.1870;
        // Use the same function as the real app
        const found = yield dispatch_service_1.DispatchService.findNearestCourier(pickupLat, pickupLng, 'motorcycle');
        if (found) {
            console.log('SUCCESS: DispatchService found this courier:', found.full_name);
        }
        else {
            console.error('FAILURE: DispatchService returned NO couriers.');
            console.log('Possible reasons: Distance > 5km, is_online=false, vehicle_type mismatch.');
        }
    }
    catch (err) {
        console.error('Debug Error:', err);
    }
    finally {
        db_1.default.end();
    }
});
debugDispatch();
