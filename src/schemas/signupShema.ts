import {z} from "zod";

export const usernameValidation = z
.string()
.min(6, "username must be atleast 6 character")
.max(20, "username must be more than 20 character")
.regex(/^[a-zA-Z0-9_]+$/ , "username must not contian spacial character")

export const singUpSchema = z.object({
    username : usernameValidation,
    email:z.string().email({message:"Invalid email address"}),
    password: z.string().min(6, {message:"password must be atleast 6 character"}).max(20)
})