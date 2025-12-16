import { Injectable,ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async createUser(email: string, password: string) {
        const exist = await this.prisma.user.findUnique({ where: { email } });
        if (exist) {
            throw new ConflictException('Email already in use');
        }
        const hash = await bcrypt.hash(password, 10);
        return this.prisma.user.create({
            data: {
                email,
                password: hash,
            },
        });
    }

    async findUserByEmail(email:string){
        return this.prisma.user.findUnique({where:{email}});
    }

    async findPublicUseryById(id:string){
        return this.prisma.user.findUnique({where:{id},select:{id:true,email:true,role:true,createdAt:true}});
    }
}

