import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export class FileController {
  async upload(req: Request, res: Response): Promise<void> {
    try {
      const files = (req as any).files || (req as any).file ? [(req as any).file] : [];
      if (!files.length) {
        res.status(400).json({ error: 'Bad Request', message: 'No files uploaded' });
        return;
      }
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const uploadPath = process.env['UPLOAD_PATH'] || './uploads';
      const thumbDir = path.join(uploadPath, 'thumbnails');
      if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });

      const results = await Promise.all(files.map(async (file: any) => {
        const isImage = file.mimetype.startsWith('image/');
        let thumbnailUrl: string | null = null;
        if (isImage) {
          const ext = path.extname(file.filename) || '.jpg';
          const thumbName = `${path.basename(file.filename, ext)}-thumb.jpg`;
          const thumbPath = path.join(thumbDir, thumbName);
          try {
            await sharp(file.path).resize({ width: 320 }).jpeg({ quality: 80 }).toFile(thumbPath);
            thumbnailUrl = `${baseUrl}/uploads/thumbnails/${thumbName}`;
          } catch (_) {}
        }
        return {
          originalName: file.originalname,
          filename: file.filename,
          size: file.size,
          mimeType: file.mimetype,
          url: `${baseUrl}/uploads/${file.filename}`,
          thumbnailUrl
        };
      }));

      res.status(201).json({ success: true, data: { files: results } });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error', message: (error as Error).message });
    }
  }

  async serve(req: Request, res: Response): Promise<void> {
    const uploadPath = process.env['UPLOAD_PATH'] || './uploads';
    const filename = req.params['filename'];
    if (!filename) {
      res.status(400).json({ error: 'Bad Request', message: 'Filename required' });
      return;
    }
    const filePath = path.join(uploadPath, filename);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'Not Found' });
      return;
    }
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Content-Disposition', 'inline');
    res.sendFile(path.resolve(filePath));
  }

  async serveThumbnail(req: Request, res: Response): Promise<void> {
    const uploadPath = process.env['UPLOAD_PATH'] || './uploads';
    const filename = req.params['filename'];
    if (!filename) {
      res.status(400).json({ error: 'Bad Request', message: 'Filename required' });
      return;
    }
    const thumbPath = path.join(uploadPath, 'thumbnails', filename);
    if (!fs.existsSync(thumbPath)) {
      res.status(404).json({ error: 'Not Found' });
      return;
    }
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Content-Disposition', 'inline');
    res.sendFile(path.resolve(thumbPath));
  }
}




