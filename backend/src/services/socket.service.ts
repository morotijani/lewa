import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

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
            socket.on('updateLocation', (data: { courierId: string; lat: number; lng: number }) => {
                // Broadcast to relevant rooms (e.g., admin, or specific user tracking this courier)
                // For MVP, just broadcast to everyone or a specific 'tracking' room
                // Real app: socket.to(`tracking_${data.courierId}`).emit('locationUpdated', data);

                console.log(`Location update from ${data.courierId}:`, data);
                socket.broadcast.emit('courierLocationUpdate', data);
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
