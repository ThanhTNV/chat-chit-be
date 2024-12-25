import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class MessageGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('create-room')
  handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ) {
    client.join(room);
    client.emit('message-from-server', `Created room ${room}`);
  }

  @SubscribeMessage('join')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
    client.join(room);
    client.emit('message-from-server', `Joined room ${room}`);
  }

  @SubscribeMessage('leave')
  handleLeave(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
    client.leave(room);
    client.emit('message-from-server', `Left room ${room}`);
  }

  @SubscribeMessage('invite-to-room')
  handleInviteToRoom(client: Socket, payload: { room: string; user: string }) {
    client.to(payload.user).emit('invite-to-room', payload.room);
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: { room: string; message: string }) {
    if (client.rooms.has(payload.room)) {
      this.server.in(payload.room).emit('message', {
        user: client.id,
        message: payload.message,
      });
    }
  }
}
