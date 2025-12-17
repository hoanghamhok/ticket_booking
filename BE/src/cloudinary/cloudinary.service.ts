import { Inject, Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY } from './cloudinary.provider';

@Injectable()
export class CloudinaryService {
  constructor(@Inject(CLOUDINARY) private readonly cld: typeof cloudinary) {}

  uploadBuffer(
    fileBuffer: Buffer,
    opts?: { folder?: string; public_id?: string },
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cld.uploader.upload_stream(
        {
          folder: opts?.folder,
          public_id: opts?.public_id,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(error);

          // Guard against undefined result to satisfy strict TypeScript checks
          if (!result) {
            return reject(new Error('Cloudinary upload returned no result'));
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      uploadStream.end(fileBuffer);
    });
  }
}
