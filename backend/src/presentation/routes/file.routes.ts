import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { FileController } from '../controllers/file.controller';

const uploadPath = process.env['UPLOAD_PATH'] || './uploads';
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadPath),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
    cb(null, `${Date.now()}_${base}${ext}`);
  }
});

const allowed = (process.env['ALLOWED_FILE_TYPES'] || '').split(',').filter(Boolean);
const maxSize = Number(process.env['MAX_FILE_SIZE'] || 10 * 1024 * 1024);

function fileFilter(_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (allowed.length === 0 || allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error('File type not allowed'));
}

const upload = multer({ storage, limits: { fileSize: maxSize }, fileFilter });

const controller = new FileController();
export const fileRoutes = Router();

fileRoutes.post('/upload', upload.array('files', 10), controller.upload.bind(controller));
fileRoutes.get('/raw/:filename', controller.serve.bind(controller));
fileRoutes.get('/thumbnails/:filename', controller.serveThumbnail.bind(controller));




