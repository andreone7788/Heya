import multer from 'multer';
import path from 'path';

// Configurazione storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/avatars');
    },
    filename: (req, file, cb) => {
        // Genera un nome di file univoco: userId-timestamp.ext
        const userId = (req.session as any).userId;
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `${userId}-${timestamp}${ext}`);
    }
});

// Filtro per accettare solo immagini
const fileFilter = (req: any, file: any, cb: any) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
};

// Export middleware di upload
export const uploadAvatar = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Limite di 5MB
}).single('avatar');