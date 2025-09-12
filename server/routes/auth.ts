import { RequestHandler } from "express";
import { hashPassword, store, createToken } from "../store";
import type { LoginRequest, LoginResponse, SignupRequest, SignupResponse } from "@shared/api";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const signup: RequestHandler = (req, res) => {
  const body = req.body as SignupRequest;
  if (!emailRegex.test(body.email)) {
    return res.status(400).json({ message: "Invalid email format" satisfies SignupResponse });
  }
  if (!body.password || body.password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" } as SignupResponse);
  }

  const exists = Array.from(store.users.values()).find((u) => u.email === body.email);
  if (exists) {
    return res.status(400).json({ message: "Email already registered" } as SignupResponse);
  }

  const id = cryptoRandom();
  store.users.set(id, {
    id,
    email: body.email,
    passwordHash: hashPassword(body.password),
  });

  res.json({ message: "User registered successfully" } as SignupResponse);
};

export const login: RequestHandler = (req, res) => {
  const body = req.body as LoginRequest;
  const user = Array.from(store.users.values()).find((u) => u.email === body.email);
  if (!user || user.passwordHash !== hashPassword(body.password)) {
    return res.status(401).json({ token: "" } as LoginResponse);
  }
  const token = createToken();
  store.sessions.set(token, { token, userId: user.id });
  res.json({ token } as LoginResponse);
};

function cryptoRandom() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
