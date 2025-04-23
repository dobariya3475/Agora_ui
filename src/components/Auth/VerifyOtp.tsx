import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import backgroundImage from '../../assets/background.svg'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import Header from '../Header'
import { useNavigate } from 'react-router-dom'
import { verifyOTP } from 'src/service/AuthService'
import { toast } from 'react-toastify'
const otpSchema = z.object({
  otp: z
    .string()
    .min(6, 'OTP must be exactly 6 digits')
    .max(6, 'OTP number must be exactly 6 digits')
});



let UID = null;

// const CHANNEL = 'interview-' + UID;
// const channel: string = `interview-${localStorage.getItem('userId')}`
let channel = null;

export default function VerifyOtp () {
  const form = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: ''
    }
  })
  const navigate = useNavigate()
  const email = localStorage.getItem('email')

  const onSubmit = async (values: z.infer<typeof otpSchema>) => {
    try {
      const response = await verifyOTP({ otp: values.otp });
    
      if (response.success) {
        // Simply navigate to waiting room after successful OTP verification
        navigate('/waiting-room');
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again later.');
    }
    
  }

  return (
    <main className='h-screen w-screen'>
      <Header />
      <div className='relative  h-[calc(100%-80px)]'>
        <div className='absolute top-32'>
          <img src={`${backgroundImage}`} alt='background image' />
        </div>
        <div className='flex justify-center items-center  h-full z-10  relative'>
          <div className=' shadow-lg p-5 px-9 rounded-md flex flex-col justify-center bg-white'>
            <h1 className='font-semibold text-[24px]'>Verify with OTP</h1>
            <span className='text-[#757575]'>
              Enter the OTP sent to {email}
            </span>
            <span className='text-[#226CFF] cursor-pointer'>Change</span>
            <div className='mt-5 '>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='space-y-5'
                >
                  <FormField
                    control={form.control}
                    name='otp'
                    render={({ field }) => (
                      <FormItem>
                        <Label className=' text-[14px] font-[400]'>
                          OTP <span className='text-red-500'>*</span>
                        </Label>

                        <FormControl>
                          <Input
                            {...field}
                            className='focus-visible:ring-0 focus-visible:ring-offset-0 border-[#D9D9D9] rounded-[10px]'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button className='font-[600] text-[14px] rounded-[10px] bg-black text-white w-32 text-center flex justify-center hover:bg-black hover:text-white '>
                    Verify OTP
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
