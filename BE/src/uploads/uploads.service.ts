import { Inject, Injectable } from '@nestjs/common';
import { v2 as CloudinaryType } from 'cloudinary';
import { CLOUDINARY } from '../cloudinary/cloudinary.provider';

@Injectable()
export class UploadsService {
  constructor(@Inject(CLOUDINARY) private cloudinary: typeof CloudinaryType) {}

  uploadBuffer(fileBuffer: Buffer, folder: string) {
    return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result!.secure_url,
            publicId: result!.public_id,
          });
        },
      );

      uploadStream.end(fileBuffer);
    });
  }
}
