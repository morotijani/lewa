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
exports.AuthService = void 0;
const db_1 = __importDefault(require("../db"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_123';
exports.AuthService = {
    // Simulates sending an OTP (just returns hardcoded 1234 for dev)
    sendOtp(phoneNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            // In production, integrate with SMS provider (e.g., Twilio, Arkesel)
            console.log(`Sending OTP to ${phoneNumber}`);
            return { success: true, otp: '1234' };
        });
    },
    // Register or Login with Phone Number + OTP (Mocked for now as "Password" flow to simplicity or direct create)
    // For this phase, let's implement a direct Register and Login flow to establish users.
    register(phone_1, email_1, fullName_1) {
        return __awaiter(this, arguments, void 0, function* (phone, email, fullName, role = 'customer', password) {
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
            try {
                const result = yield db_1.default.query(`INSERT INTO users (phone_number, email, full_name, role, password_hash) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, full_name, role, phone_number`, [phone, email, fullName, role, hashedPassword]);
                const user = result.rows[0];
                const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
                return {
                    user,
                    token,
                    hasCourierProfile: false // New user definitely has no profile
                };
            }
            catch (err) {
                if (err.code === '23505') { // Unique violation
                    throw new Error('User already exists');
                }
                throw err;
            }
        });
    },
    login(phone, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.default.query('SELECT * FROM users WHERE phone_number = $1', [phone]);
            const user = result.rows[0];
            if (!user)
                throw new Error('Invalid credentials');
            const validPassword = yield bcryptjs_1.default.compare(password, user.password_hash);
            if (!validPassword)
                throw new Error('Invalid credentials');
            const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
            // Check for courier profile
            let hasCourierProfile = false;
            if (user.role === 'courier') {
                const courierRes = yield db_1.default.query('SELECT id FROM couriers WHERE user_id = $1', [user.id]);
                hasCourierProfile = courierRes.rows.length > 0;
            }
            return {
                user: { id: user.id, name: user.full_name, role: user.role, phone_number: user.phone_number },
                token,
                hasCourierProfile
            };
        });
    }
};
