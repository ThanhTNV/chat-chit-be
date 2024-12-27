import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class MessageGateway implements OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  @SubscribeMessage('create-room')
  handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ) {
    client.join(room);
    this.server.to(room).emit('message-from-server', {
      message: `${client.id} created the room`,
    });
  }

  @SubscribeMessage('join')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
    client.join(room);
    console.log(`${client.id} join the room ${room}`);
    this.server.to(room).emit('message-from-server', {
      message: `${client.id} joined the room`,
    });
  }

  @SubscribeMessage('leave')
  handleLeave(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
    const { id } = client;
    client.leave(room);
    console.log(`${id} leave the room ${room}`);
    this.server.to(room).emit('message-from-server', {
      message: `${id} left the room`,
    });
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

  handleDisconnect(@ConnectedSocket() client: Socket): any {
    const room = client.rooms[0];
    if (!!room) {
      this.server.to(room).emit('message-from-server', {
        message: `${client.id} left the room`,
      });
    }
  }
}
