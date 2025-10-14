import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private httpService: HttpService) {}

  async incrementSearchCount(userId: string): Promise<void> {
    try {
      const mutation = `
        mutation IncrementSearchCount($userId: String!) {
          incrementSearchCount(userId: $userId)
        }
      `;

      await firstValueFrom(
        this.httpService.post('graphql', {
          query: mutation,
          variables: { userId },
        }),
      );
    } catch (error) {
      this.logger.error(`Failed to increment search count: ${error.message}`);
      // Don't throw - statistics tracking should not break the main flow
    }
  }

  async incrementAnalysisCount(userId: string): Promise<void> {
    try {
      const mutation = `
        mutation IncrementAnalysisCount($userId: String!) {
          incrementAnalysisCount(userId: $userId)
        }
      `;

      await firstValueFrom(
        this.httpService.post('graphql', {
          query: mutation,
          variables: { userId },
        }),
      );
    } catch (error) {
      this.logger.error(`Failed to increment analysis count: ${error.message}`);
      // Don't throw - statistics tracking should not break the main flow
    }
  }
}

