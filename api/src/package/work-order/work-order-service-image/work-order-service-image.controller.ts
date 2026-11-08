import { randomUUID } from 'crypto';
import { extname, join } from 'path';

import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { diskStorage } from 'multer';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';

import { AddWorkOrderServiceImageUseCase } from './add-work-order-service-image.use-case';
import { FetchWorkOrderServiceImagesUseCase } from './fetch-work-order-service-images.use-case';
import { RemoveWorkOrderServiceImageUseCase } from './remove-work-order-service-image.use-case';

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
export class WorkOrderServiceImageController {
  constructor(
    private addWorkOrderServiceImage: AddWorkOrderServiceImageUseCase,
    private fetchWorkOrderServiceImages: FetchWorkOrderServiceImagesUseCase,
    private removeWorkOrderServiceImage: RemoveWorkOrderServiceImageUseCase,
  ) {}

  @Get()
  async get(
    @Param('workOrderId') workOrderId: string,
    @Param('serviceId') serviceId: string,
  ) {
    try {
      const { images } = await this.fetchWorkOrderServiceImages.handle({
        workOrderId,
        serviceId,
      });

      return { images };
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', serviceImageMulterOptions()))
  async upload(
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

      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(
    @Param('workOrderId') workOrderId: string,
    @Param('serviceId') serviceId: string,
    @Param('id') imageId: string,
  ) {
    try {
      await this.removeWorkOrderServiceImage.handle({
        workOrderId,
        serviceId,
        imageId,
      });
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }
}
