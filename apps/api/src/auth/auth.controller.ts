import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Redirect to Google OAuth' })
  googleAuth() {
    // Guard redirects to Google
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    const user = await this.authService.validateGoogleUser(req.user);
    const token = this.authService.generateToken(user);

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}?login=success`);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user info' })
  async getCurrentUser(@CurrentUser() user: any) {
    return this.authService.getUserById(user.id);
  }

  @Public()
  @Get('logout')
  @ApiOperation({ summary: 'Logout and clear cookie' })
  logout(@Res() res: Response) {
    res.clearCookie('token');
    res.status(HttpStatus.OK).json({ message: 'Logged out successfully' });
  }

  @Public()
  @Get('status')
  @ApiOperation({ summary: 'Check auth status' })
  async checkStatus(@Req() req: any, @Res() res: Response) {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(HttpStatus.OK).json({ authenticated: false });
    }

    try {
      // Token will be validated by JWT strategy
      return res.status(HttpStatus.OK).json({ authenticated: true });
    } catch {
      return res.status(HttpStatus.OK).json({ authenticated: false });
    }
  }
}

