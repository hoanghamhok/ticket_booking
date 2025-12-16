import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Strategy, ExtractJwt } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        const secret = configService.get<string>('JWT_SECRET');
        console.log('🔐 JwtStrategy using secret:', secret);
        
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }
    
    async validate(payload: { sub: string, role: string }) {
        console.log('✅ Token validated, payload:', payload);
        return { userId: payload.sub, role: payload.role };
    }
}