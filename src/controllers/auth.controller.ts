import { Request, Response } from "express";
import { errorResponse, successResponse } from "../helpers/response.js";
import * as authService from "../services/auth.service.js";
import { validateEmail, validateName, validatePassword } from "./validationData.controller.js";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1. Validasi input
    if (  !email || !password ) {
      res.status(400).json({ 
        message: "Email dan password wajib diisi!" 
      });
      return;
    }

    // 2. Cari user di tabel public.users berdasarkan email
    const user = await authService.findUserByEmail(email);

    // 3. Jika user tidak ditemukan
    if (!user) {
      res.status(401).json({ 
        message: "Gagal login. Email tidak terdaftar." 
      });
      return;
    }

    // 4. Pencocokan password (pencocokan string biasa)
    if (user.password !== password) {
      res.status(401).json({ 
        message: "Gagal login. Password salah." 
      });
      return;
    }

    // 5. Generate JWT token
    const token = authService.generateToken(user);

    // 6. Hapus password dari data respon demi keamanan
    delete user.password;

    res.status(200).json({
      message: "Berhasil masuk!",
      token: token,
      user: user
    });

  } catch (err) {
    console.error("Error pada Login:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const emailValidation = validateEmail(email);
    const nameValidation = validateName(name);
    const passwordValidation = validatePassword(password);

    // 1. Validasi input wajib
    if (!emailValidation.isValid || !nameValidation.isValid || !passwordValidation.isValid) {
      res.status(400).json({ 
        message: 
          (emailValidation.isValid ? "" : emailValidation.message) +" "+ 
          (nameValidation.isValid ? "" : nameValidation.message) +" "+ 
          (passwordValidation.isValid ? "" : passwordValidation.message) 
      });
      return;
    }

    // 2. Cek apakah email sudah terdaftar di database
    const user = await authService.findUserByEmail(email);

    if (user) {
      res.status(400).json({ 
        message: "Email sudah terdaftar, silakan gunakan email lain." 
      });
      return;
    }

    // 3. Simpan data user baru ke tabel users
    // (role opsional, jika tidak dikirim akan default ke 'member')
    const userRole = "member";

    const newUser = await authService.createUser({
      name,
      email,
      password,
      role: userRole
    });

    // 4. Generate JWT token
    const token = authService.generateToken(newUser);

    delete newUser.password;

    // 5. Berikan respon berhasil
    res.status(201).json({
      message: "Pendaftaran berhasil!",
      token: token,
      user: newUser
    });

  } catch (err) {
    console.error("Error pada Register:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id || (req as any).user?.sub;
    if (!userId) {
      res.status(401).json({ message: "Tidak terautentikasi" });
      return;
    }

    const user = await authService.findUserById(userId);
    if (!user) {
      res.status(404).json({ message: "User tidak ditemukan" });
      return;
    }

    delete user.password;
    res.status(200).json({
      message: "Berhasil mendapatkan data user",
      data: user,
      ...user
    });
  } catch (err) {
    console.error("Error pada getMe:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};