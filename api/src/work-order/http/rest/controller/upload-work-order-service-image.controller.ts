import { randomUUID } from 'crypto';
import { extname, join } from 'path';

import {
  BadRequestException,
  Controller,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Express } from 'express';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import { AddWorkOrderServiceImageUseCase } from '@/work-order/core/use-case/add-work-order-service-image.use-case';

const WORK_ORDER_SERVICE_IMAGES_DIR = 'work-order-service-images';

function serviceImageMulterOptions() {
  return {
    storage: diskStorage({
      destination: join(
        process.cwd(),
        'uploads',
        WORK_ORDER_SERVICE_IMAGES_DIR,
      ),
      filename: (_req, file, cb) => {
        const ext = extname(file.originalname) || '';
        cb(null, `${randomUUID()}${ext}`);
      },
    }),
  };
}

@Controller('/work-orders/:workOrderId/services/:serviceId/images')
export class UploadWorkOrderServiceImageController {
  constructor(
    private readonly addWorkOrderServiceImage: AddWorkOrderServiceImageUseCase,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', serviceImageMulterOptions()))
  async handle(
    @Param('workOrderId') workOrderId: string,
    @Param('serviceId') serviceId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const url = `/uploads/${WORK_ORDER_SERVICE_IMAGES_DIR}/${file.filename}`;

    try {
      const { image } = await this.addWorkOrderServiceImage.handle({
        workOrderId,
        serviceId,
        url,
      });

      return { image };
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw new BadRequestException(
        error instanceof Error ? error.message : 'Bad request',
      );
    }
  }
}
