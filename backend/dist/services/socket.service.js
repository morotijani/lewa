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
exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
const db_1 = __importDefault(require("../db"));
class SocketService {
    static init(httpServer) {
        this.io = new socket_io_1.Server(httpServer, {
            cors: {
                origin: '*', // Allow all origins for dev; restrict in prod
                methods: ['GET', 'POST']
            }
        });
        this.io.on('connection', (socket) => {
            console.log(`New client connected: ${socket.id}`);
            // Handle courier location updates
            socket.on('updateLocation', (data) => __awaiter(this, void 0, void 0, function* () {
                // Broadcast to customers/admin
                socket.broadcast.emit('courierLocationUpdate', data);
                // PERSIST to Database for DispatchService
                try {
                    // data.courierId is the user_id (from mobile)
                    yield db_1.default.query(`UPDATE couriers SET current_lat = $1, current_lng = $2, last_location_update = NOW() WHERE user_id = $3`, [data.lat, data.lng, data.courierId]);
                }
                catch (err) {
                    console.error('Failed to update courier location in DB:', err);
                }
            }));
            // Identify user and join their room
            socket.on('identify', (userId) => {
                socket.join(`user_${userId}`);
                console.log(`Socket ${socket.id} identified as user_${userId}`);
            });
            // Handle joining order room for updates
            socket.on('joinOrder', (orderId) => {
                socket.join(`order_${orderId}`);
                console.log(`Socket ${socket.id} joined room order_${orderId}`);
            });
            socket.on('disconnect', () => {
                console.log(`Client disconnected: ${socket.id}`);
            });
        });
    }
    static getIO() {
        if (!this.io) {
            throw new Error('Socket.io not initialized!');
        }
        return this.io;
    }
    // Helper to emit events from other services (e.g. DispatchService)
    static emitToRoom(room, event, data) {
        if (this.io) {
            this.io.to(room).emit(event, data);
        }
    }
}
exports.SocketService = SocketService;
