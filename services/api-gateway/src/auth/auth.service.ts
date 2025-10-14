import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private httpService: HttpService) {}

  async register(email: string, password: string, username?: string, displayName?: string) {
    const query = `
      mutation Register($input: RegisterInput!) {
        register(input: $input) {
          accessToken
          refreshToken
          user {
            id
            email
            username
            displayName
            role
            subscriptionTier
            dailyRequestsUsed
            dailyRequestsLimit
          }
        }
      }
    `;

    try {
      const { data } = await firstValueFrom(
        this.httpService.post('/graphql', {
          query,
          variables: {
            input: { email, password, username, displayName },
          },
        }),
      );

      if (data.errors) {
        this.logger.error('Register error:', data.errors);
        throw new Error(data.errors[0].message);
      }

      return data.data.register;
    } catch (error) {
      this.logger.error('Register failed:', error.message);
      throw error;
    }
  }

  async login(email: string, password: string) {
    const query = `
      mutation Login($input: LoginInput!) {
        login(input: $input) {
          accessToken
          refreshToken
          user {
            id
            email
            username
            displayName
            role
            subscriptionTier
            dailyRequestsUsed
            dailyRequestsLimit
            lastLoginAt
          }
        }
      }
    `;

    try {
      const { data } = await firstValueFrom(
        this.httpService.post('/graphql', {
          query,
          variables: {
            input: { email, password },
          },
        }),
      );

      if (data.errors) {
        this.logger.error('Login error:', data.errors);
        throw new Error(data.errors[0].message);
      }

      return data.data.login;
    } catch (error) {
      this.logger.error('Login failed:', error.message);
      throw error;
    }
  }

  async refreshToken(refreshToken: string) {
    const query = `
      mutation RefreshToken($refreshToken: String!) {
        refreshToken(refreshToken: $refreshToken) {
          accessToken
          refreshToken
          user { id email subscriptionTier }
        }
      }
    `;

    try {
      const { data } = await firstValueFrom(
        this.httpService.post('/graphql', {
          query,
          variables: { refreshToken },
        }),
      );

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      return data.data.refreshToken;
    } catch (error) {
      this.logger.error('Token refresh failed:', error.message);
      throw error;
    }
  }

  async getMe(accessToken: string) {
    const query = `
      query Me {
        me {
          id
          email
          username
          displayName
          avatarUrl
          role
          subscriptionTier
          dailyRequestsUsed
          dailyRequestsLimit
          lastRequestReset
          emailVerified
          searchCount
          analysisCount
          charactersLearned
          studyTimeMinutes
          lastActiveAt
          createdAt
          lastLoginAt
        }
      }
    `;

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          '/graphql',
          { query },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        ),
      );

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      return data.data.me;
    } catch (error) {
      this.logger.error('Get me failed:', error.message);
      throw error;
    }
  }

  async logout(accessToken: string, refreshToken: string) {
    const query = `
      mutation Logout($refreshToken: String!) {
        logout(refreshToken: $refreshToken)
      }
    `;

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          '/graphql',
          {
            query,
            variables: { refreshToken },
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        ),
      );

      return data.data.logout;
    } catch (error) {
      this.logger.error('Logout failed:', error.message);
      throw error;
    }
  }
}

