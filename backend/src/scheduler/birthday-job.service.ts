// src/scheduler/birthday-job.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserService } from '../user/user.service';
import { sendEmail } from 'src/utils/emails';


@Injectable()
export class BirthdayJobService {
  private readonly logger = new Logger(BirthdayJobService.name);
  private sentTodayUserIds = new Set<number>(); // bộ nhớ tạm
  private lastResetDate: string = this.formatDate(new Date());

  private formatDate(date: Date) {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  constructor(private userService: UserService) {}

  @Cron('*/10 * * * *') // Chạy mỗi 5 phút
    async handleBirthdayEmails() {
      try {
        this.logger.log('Running birthday email job...');

        // reset mỗi ngày
        const todayStr = this.formatDate(new Date());
        if (todayStr !== this.lastResetDate) {
          this.sentTodayUserIds.clear();
          this.lastResetDate = todayStr;
          this.logger.log('New day: Reset sent user cache');
        }

        const users = await this.userService.getUsersWithBirthdayToday();

        const usersToSend = users.filter(u => !this.sentTodayUserIds.has(u.id));
        if (usersToSend.length === 0) {
          this.logger.log('No new users with birthdays today');
          return;
        }

        this.logger.log(`Found ${usersToSend.length} new users to send birthday email`);

        for (const user of usersToSend) {
          try {
            await sendEmail(
              user.email,
              '🎉 Chúc mừng sinh nhật! 🎂',
              `Chào ${user.full_name || user.email},\n\nChúc mừng sinh nhật! 🎉🎂\n\nChúc bạn có một ngày sinh nhật thật vui vẻ và hạnh phúc!\nTừ đội ngũ phát triển hệ thống.\n\nTrân trọng! ❤️`
            );

            this.logger.log(`Birthday email sent to ${user.email}`);
            this.sentTodayUserIds.add(user.id);
          } catch (error) {
            this.logger.error(`Failed to send birthday email to ${user.email}:`, error);
          }
        }
      } catch (error) {
        this.logger.error('Error in birthday email job:', error);
      }
    }
}