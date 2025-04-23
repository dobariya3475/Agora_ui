import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import backgroundImage from "../../assets/background.svg";
import { number, z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { login } from "src/service/AuthService";
import Header from "../Header";
import { toast } from "react-toastify";

const loginSchema = z.object({
  mobile: z
    .string()
    .min(10, "Mobile number must be exactly 10 digits")
    .max(10, "Mobile number must be exactly 10 digits")
    .regex(/^\d{10}$/, "Invalid mobile number"),
  userId: z.string(),
});

export default function Login() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEnable , setIsEnable] = useState(false)
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      mobile: "",
      userId: id,
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setIsEnable(true)
      const response = await login({
        number: values.mobile,
        userId: values.userId,
      });
      if (response.success) {
        localStorage.setItem("token", response.data.accessToken);
        localStorage.setItem("email",response.data.email)
        toast.success("OTP sent to your mail");
        setTimeout(()=>{
          navigate("/verify-otp");
        },1000)
      } else {
        setIsEnable(false);
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <>
      <main className="h-screen w-screen">
        <Header />
        <div className="relative h-[calc(100%-80px)] ">
          <div className="absolute top-32">
            <img src={`${backgroundImage}`} alt="background image" />
          </div>
          <div className="flex justify-center items-center h-full z-10  relative">
            <div className=" shadow-lg p-5 rounded-md flex flex-col justify-center bg-white">
              <h1 className="font-semibold text-[24px]">Login</h1>
              <span className="text-[#757575]">
                Enter the details below to login to your account
              </span>
              <div className="mt-5 ">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-5"
                  >
                    <FormField
                      control={form.control}
                      name="mobile"
                      render={({ field }) => (
                        <FormItem>
                          <Label className=" text-[14px] font-[400]">
                            Mobile No. <span className="text-red-500">*</span>
                          </Label>

                          <FormControl>
                            <Input
                              {...field}
                              className="focus-visible:ring-0 focus-visible:ring-offset-0 border-[#D9D9D9] rounded-md"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button className="font-[600] text-[14px] rounded-md bg-black text-white w-32 text-center flex justify-center hover:bg-black hover:text-white " disabled={isEnable} >
                      Login
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
