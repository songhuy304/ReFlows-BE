import { UserEntity } from '@/common/database/entities/user.entity';

export interface IAuthMailService {
  forgotPasswordMail: (user: UserEntity, token: string) => Promise<void>;
}
