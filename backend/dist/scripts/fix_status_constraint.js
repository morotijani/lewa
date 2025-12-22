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
function updateConstraint() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Updating orders table status constraint...');
            // First, drop the existing constraint
            yield db_1.default.query('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check');
            // Add the new constraint with all required statuses
            yield db_1.default.query(`
      ALTER TABLE orders 
      ADD CONSTRAINT orders_status_check 
      CHECK (status IN ('created', 'assigned', 'accepted', 'picked_up', 'delivered', 'cancelled', 'pending'))
    `);
            console.log('Constraint updated successfully.');
        }
        catch (err) {
            console.error('Error updating constraint:', err);
        }
        finally {
            db_1.default.end();
        }
    });
}
updateConstraint();
