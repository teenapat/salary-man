import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

interface GoogleUser {
  googleId: string;
  email: string;
  name: string;
  picture: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateGoogleUser(googleUser: GoogleUser) {
    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { googleId: googleUser.googleId },
    });

    if (!user) {
      // Create new user
      user = await this.prisma.user.create({
        data: {
          googleId: googleUser.googleId,
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
        },
      });

      // Create default accounts for new user
      await this.createDefaultAccounts(user.id);
    } else {
      // Update user info
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
        },
      });
    }

    return user;
  }

  async createDefaultAccounts(userId: string) {
    const defaultAccounts = [
      { name: 'เงินสด', type: 'CASH', sortOrder: 1 },
      { name: 'ย้ายยอด', type: 'CARRY_OVER', sortOrder: 100 },
    ];

    await this.prisma.account.createMany({
      data: defaultAccounts.map((acc) => ({
        ...acc,
        userId,
      })),
    });
  }

  generateToken(user: { id: string; email: string }) {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        accounts: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }
}

