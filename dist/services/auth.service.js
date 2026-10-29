import pool from "../config/database.js";
import jwt from 'jsonwebtoken';
export const findUserByEmail = async (email) => {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0];
};
export const findUserById = async (id) => {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0];
};
export const createUser = async (data) => {
    const { name, email, password, role } = data;
    const query = `
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    const result = await pool.query(query, [name, email, password, role]);
    return result.rows[0];
};
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_kamu';
export const generateToken = (user) => {
    const payload = {
        id: user.id,
        sub: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
};
export const loginService = async (email, password) => {
    const user = await findUserByEmail(email);
    if (!user) {
        throw new Error('User not found');
    }
    if (user.password !== password) {
        throw new Error('Invalid password');
    }
    const token = generateToken(user);
    delete user.password;
    return { token, user };
};
