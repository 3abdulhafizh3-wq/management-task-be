import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_kamu';
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Mengambil string token setelah 'Bearer '
    if (!token) {
        return res.status(401).json({ message: 'Akses ditolak, token tidak ditemukan!' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Menyimpan data payload ke req.user
        next(); // Lanjut ke controller
    }
    catch (error) {
        return res.status(403).json({ message: 'Token tidak valid atau sudah kadaluwarsa!' });
    }
};
