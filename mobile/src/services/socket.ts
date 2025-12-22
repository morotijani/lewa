import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';

const URL = Platform.OS === 'android'
    ? 'http://192.168.0.122:3000'
    : 'http://192.168.0.122:3000';

class SocketService {
    private socket: Socket | null = null;

    connect(userId: string) {
        if (this.socket) {
            this.socket.disconnect();
        }

        this.socket = io(URL, {
            transports: ['websocket'],
            forceNew: true,
        });

        this.socket.on('connect', () => {
            console.log('Socket Connected:', this.socket?.id);
            this.socket?.emit('identify', userId);
        });

        this.socket.on('disconnect', () => {
            console.log('Socket Disconnected');
        });

        this.socket.on('connect_error', (err) => {
            console.log('Socket Connection Error:', err);
        });
    }

    on(event: string, callback: (data: any) => void) {
        this.socket?.on(event, callback);
    }

    off(event: string, callback?: (data: any) => void) {
        if (callback) {
            this.socket?.off(event, callback);
        } else {
            this.socket?.off(event);
        }
    }

    emit(event: string, data: any) {
        this.socket?.emit(event, data);
    }

    disconnect() {
        this.socket?.disconnect();
        this.socket = null;
    }
}

export default new SocketService();
