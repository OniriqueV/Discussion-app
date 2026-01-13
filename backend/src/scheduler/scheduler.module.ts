// src/scheduler/scheduler.module.ts
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BirthdayJobService } from './birthday-job.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    UserModule,
  ],
  providers: [BirthdayJobService],
})
export class SchedulerModule {}