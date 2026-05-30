import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from './pets.entity';

@WebSocketGateway({
  cors: { origin: true, credentials: true },
  namespace: 'pet',
})
export class PetGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectRepository(Pet)
    private petRepo: Repository<Pet>,
  ) {}

  handleConnection(client: Socket) {
    const ownerId = client.handshake.query.ownerId as string | undefined;
    if (ownerId) {
      client.data.ownerId = ownerId;
    }
  }

  handleDisconnect(client: Socket) {
    // Socket.IO rooms are auto-cleaned on disconnect
  }

  @SubscribeMessage('subscribe')
  async handleSubscribe(client: Socket, petId: string) {
    const ownerId = client.data.ownerId as string | undefined;
    if (ownerId && petId) {
      const pet = await this.petRepo.findOne({
        where: { id: petId, ownerId },
        select: { id: true },
      });
      if (!pet) {
        client.emit('error', { message: 'Access denied or pet not found' });
        return;
      }
    }
    const room = `pet:${petId}`;
    client.join(room);
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(client: Socket, petId: string) {
    const room = `pet:${petId}`;
    client.leave(room);
  }

  emitPetUpdate(petId: string, data: any) {
    const room = `pet:${petId}`;
    this.server.to(room).emit('petUpdate', data);
  }
}
