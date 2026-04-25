export type WorkOrderServiceImageDto = {
  id: string;
  serviceId: string;
  url: string;
};

export type WorkOrderServiceImageResponseDto = {
  image: WorkOrderServiceImageDto;
};

export type WorkOrderServiceImagesResponseDto = {
  images: WorkOrderServiceImageDto[];
};
