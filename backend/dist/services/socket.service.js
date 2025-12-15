"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
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
            socket.on('updateLocation', (data) => {
                // Broadcast to relevant rooms (e.g., admin, or specific user tracking this courier)
                // For MVP, just broadcast to everyone or a specific 'tracking' room
                // Real app: socket.to(`tracking_${data.courierId}`).emit('locationUpdated', data);
                console.log(`Location update from ${data.courierId}:`, data);
                socket.broadcast.emit('courierLocationUpdate', data);
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
