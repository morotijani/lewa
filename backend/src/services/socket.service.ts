import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import pool from '../db';

export class SocketService {
    private static io: SocketIOServer;

    public static init(httpServer: HttpServer): void {
        this.io = new SocketIOServer(httpServer, {
            cors: {
                origin: '*', // Allow all origins for dev; restrict in prod
                methods: ['GET', 'POST']
            }
        });

        this.io.on('connection', (socket: Socket) => {
            console.log(`New client connected: ${socket.id}`);

            // Handle courier location updates
            socket.on('updateLocation', async (data: { courierId: string; lat: number; lng: number }) => {
                // Broadcast to customers/admin
                socket.broadcast.emit('courierLocationUpdate', data);

                // PERSIST to Database for DispatchService
                try {
                    // data.courierId is the user_id (from mobile)
                    await pool.query(
                        `UPDATE couriers SET current_lat = $1, current_lng = $2, last_location_update = NOW() WHERE user_id = $3`,
                        [data.lat, data.lng, data.courierId]
                    );
                } catch (err) {
                    console.error('Failed to update courier location in DB:', err);
                }
            });

            // Identify user and join their room
            socket.on('identify', (userId: string) => {
                socket.join(`user_${userId}`);
                console.log(`Socket ${socket.id} identified as user_${userId}`);
            });

            // Handle joining order room for updates
            socket.on('joinOrder', (orderId: string) => {
                socket.join(`order_${orderId}`);
                console.log(`Socket ${socket.id} joined room order_${orderId}`);
            });

            socket.on('disconnect', () => {
                console.log(`Client disconnected: ${socket.id}`);
            });
        });
    }

    public static getIO(): SocketIOServer {
        if (!this.io) {
            throw new Error('Socket.io not initialized!');
        }
        return this.io;
    }

    // Helper to emit events from other services (e.g. DispatchService)
    public static emitToRoom(room: string, event: string, data: any) {
        if (this.io) {
            this.io.to(room).emit(event, data);
        }
    }
}
