import * as bcrypt from 'bcrypt';
import { firstValueFrom } from 'rxjs';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CreatePostDto } from './dto/create-post.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePostDto } from './dto/update-post.dto';

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

  async updatePost(id: number, updatePostDto: UpdatePostDto) {
    const validCheck = await this.isValidRequest(id, updatePostDto);

    if (validCheck !== true) {
      throw validCheck;
    }

    return await this.prismaService.posts.update({
      where: { id },
      data: { title: updatePostDto.title, content: updatePostDto.content },
      select: { title: true, content: true },
    });
  }
    }

    const existedPost = await this.prismaService.posts.findUnique({
      where: { id },
    });

  async isValidRequest(
    id: number,
    dto: UpdatePostDto | DeletePostDto,
  ): Promise<true | Error> {
    const { password } = dto;
    if (!password) {
      throw new BadRequestException('비밀번호를 입력해주세요.');
    }

    const existedPost = await this.prismaService.posts.findUnique({
      where: { id },
    });

    if (!existedPost) {
      throw new NotFoundException('해당 게시물이 존재하지 않습니다.');
    }

    if (!bcrypt.compare(password, existedPost.password)) {
      throw new BadRequestException('유효하지 않은 비밀번호입니다.');
    }

    return true;
  }
}
