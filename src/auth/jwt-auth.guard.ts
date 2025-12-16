import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    console.log('🔒 Guard triggered');
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    console.log('👤 User:', user);
    console.log('❌ Error:', err);
    console.log('ℹ️ Info:', info);
    
    if (err || !user) {
      throw err || new UnauthorizedException('Token invalid');
    }
    return user;
  }
}