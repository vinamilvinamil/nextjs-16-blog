import { email, z } from "zod";

export const signUpSchema = z.object({
    name: z.string().min(3, "Name is required"),
    email: z.email(),
    password: z.string().min(8).max(30),
    age: z.coerce.number().min(1)
});

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(8).max(30)
});