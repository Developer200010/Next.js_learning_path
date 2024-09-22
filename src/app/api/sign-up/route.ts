import dbConnection from "@/lib/dbConnection";
import UserModel from "@/models/UserModel";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificatonEmail";

export async function POST(request: Request) {
  await dbConnection();

  try {
    const { username, email, password } = await request.json();
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 }
      );
    }

    const existingUserVerifiedByEmail =await UserModel.findOne({email});
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()
    if(existingUserVerifiedByEmail){
        if(existingUserVerifiedByEmail.isVerified){
          return Response.json({
            success:false,
            message:"User already exist with this email"
          },{status: 400})
        }else{
          const hasedPassword = await bcrypt.hash(password,10)
          existingUserVerifiedByEmail.password = hasedPassword
          existingUserVerifiedByEmail.verifyCode = verifyCode;
          existingUserVerifiedByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
          await existingUserVerifiedByEmail.save();
        }
    }else{
      const hashPassword =  await bcrypt.hash(password,10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);
      const newUser = new UserModel({
        username,
        email,
        password: hashPassword,
        verifyCode,
        verifyCodeExpiry:expiryDate,
        isVerified:false,
        isAcceptingMessage:true,
        message:[]
      })
      await newUser.save()
    }

    // send verification email

   const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    )

    if(!emailResponse.success){
      return Response.json({
        success: false,
        message:emailResponse.message
      },
    {
      status:500
    })
    }

    return Response.json({
      success: true,
      message:"User registered successfully, please verify you email"
    },
  {
    status:201
  })


  } catch (error) {
    console.error("Error registering user", error);
    return Response.json(
      {
        success: false,
        message: "Error registering user",
      },
      {
        status: 500,
      }
    );
  }
}
