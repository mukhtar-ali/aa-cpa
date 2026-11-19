import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { customEnv } from '@/config/custom-env';
import { UsersModule } from '@/users/users.module';

@Module({
    imports: [
        JwtModule.register({
            global: true,
            secret: customEnv.JWT_SECRET,
            signOptions: { expiresIn: '24h' },
        }),
        UsersModule,
    ],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [AuthService],
})
export class AuthModule {}
