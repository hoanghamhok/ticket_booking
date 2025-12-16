import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) {}

    async register(email: string, password: string) {
        const user = await this.usersService.createUser(email, password);
        const accessToken = await this.jwtService.signAsync({ 
            sub: user.id, 
            role: user.role 
        });
        return { user, accessToken };
    }

    async login(email: string, password: string) {
        const user = await this.usersService.findUserByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }
        
        const publicUser = await this.usersService.findPublicUseryById(user.id);
        const accessToken = await this.jwtService.signAsync({ 
            sub: user.id, 
            role: user.role 
        });
        
        return { user: publicUser, accessToken };
    }
}