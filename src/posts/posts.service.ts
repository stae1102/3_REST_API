import * as bcrypt from 'bcrypt';
import { firstValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CreatePostDto } from './dto/create-post.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsService {
  private readonly take = 20;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async createPost(createPostDto: CreatePostDto) {
    const weather_url = await this.configService.get('WEATHER_API_URL');
    const apiResult = await firstValueFrom(this.httpService.get(weather_url));
    const weather = apiResult.data.current.condition.text;

    const hashedPassword = await bcrypt.hash(createPostDto.password, 12);

    await this.prismaService.posts.create({
      data: {
        ...createPostDto,
        password: hashedPassword,
        weather,
      },
    });
    return true;
  }

  async getPostsByPage(page = 1) {
    return this.prismaService.posts.findMany({
      take: this.take,
      skip: this.take * (page - 1),
      orderBy: {
        created_at: 'desc',
      },
    });
  }
}
