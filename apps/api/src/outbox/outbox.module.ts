import { Global, Module } from '@nestjs/common';
import { EmailModule } from '@/email/email.module';
import { OutboxController } from './outbox.controller';
import { OutboxService } from './outbox.service';
import { OutboxWorker } from './outbox.worker';

@Global()
@Module({
    imports: [EmailModule],
    controllers: [OutboxController],
    providers: [OutboxService, OutboxWorker],
    exports: [OutboxService, OutboxWorker],
})
export class OutboxModule {}
