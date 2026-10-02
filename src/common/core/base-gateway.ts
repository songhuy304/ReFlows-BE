import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { HelperEncryptionService } from '../helper/services/helper.encryption.service';
export abstract class BaseGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  protected readonly logger = new Logger(this.constructor.name);
  constructor(protected readonly jwt: HelperEncryptionService) {}

  afterInit(server: Server) {
    server.use(async (socket, next) => {
      try {
        // const token = socket.handshake.auth?.token;
        // const token = socket.handshake.auth?.token;
        const token = socket.handshake.auth?.token;

        if (!token) {
          return next(new Error('Unauthorized'));
        }

        socket.data.user = await this.jwt.verifyToken(token);

        next();
      } catch {
        next(new Error('Unauthorized'));
      }
    });
  }

  handleConnection(client: Socket) {
    this.logger.log(`Connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Disconnected: ${client.id}`);
  }
}
