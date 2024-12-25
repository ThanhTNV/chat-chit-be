import { Server, Socket } from 'socket.io';
export declare class MessageGateway {
    server: Server;
    handleCreateRoom(client: Socket, room: string): void;
    handleJoin(client: Socket, room: string): void;
    handleLeave(client: Socket, room: string): void;
    handleInviteToRoom(client: Socket, payload: {
        room: string;
        user: string;
    }): void;
    handleMessage(client: Socket, payload: {
        room: string;
        message: string;
    }): void;
}
