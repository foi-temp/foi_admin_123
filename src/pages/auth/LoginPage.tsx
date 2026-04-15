import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { Phone, Lock, ArrowRight, RefreshCcw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { useAdminStore } from '../../store/useAdminStore';

export const LoginPage: React.FC = () => {
  const [step, setStep] = useState<'send' | 'verify'>('send');
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const setAuth = useAdminStore((state) => state.setAuth);

  const handleSendOtp = async (values: { phone_number: string }) => {
    setLoading(true);
    try {
      const res: any = await authApi.sendOtp(values);
      message.success(res.message || 'OTP sent successfully!');
      // Note: In development, the user might see the OTP in the console or response
      if (res.otp_code) console.log('Development OTP:', res.otp_code);
      
      setPhone(values.phone_number);
      setStep('verify');
    } catch (err) {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (values: { otp_code: string }) => {
    setLoading(true);
    try {
      const res: any = await authApi.verifyOtp({
        phone_number: phone,
        otp_code: values.otp_code
      });
      
      setAuth({ user_id: res.user_id, phone_number: phone }, res.access_token);
      message.success('Logged in successfully!');
      navigate('/');
    } catch (err) {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  if (step === 'send') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-slate-800">Welcome Back</h3>
          <p className="text-slate-500 text-sm">Log in with your phone number to continue</p>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSendOtp} className="mt-8">
          <Form.Item 
            name="phone_number" 
            label="Phone Number" 
            rules={[{ required: true, message: 'Please enter your phone number' }]}
          >
            <Input 
              prefix={<Phone size={18} className="text-slate-400 mr-2" />} 
              placeholder="9495282603" 
              className="h-12 rounded-xl"
            />
          </Form.Item>

          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            className="w-full h-12 rounded-xl bg-primary border-none shadow-lg shadow-primary/20 flex items-center justify-center gap-2 font-bold"
          >
            Get OTP <ArrowRight size={18} />
          </Button>
        </Form>

        <p className="text-center text-sm text-slate-500 mt-4">
          New admin? <Link to="/register" className="text-primary font-semibold hover:underline">Setup Super Admin</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-slate-800">Verify OTP</h3>
        <p className="text-slate-500 text-sm">Enter the code sent to {phone}</p>
      </div>

      <Form layout="vertical" onFinish={handleVerifyOtp} className="mt-8">
        <Form.Item 
          name="otp_code" 
          label="OTP Code" 
          rules={[{ required: true, message: 'Please enter the 4-digit code' }]}
        >
          <Input 
            prefix={<Lock size={18} className="text-slate-400 mr-2" />} 
            placeholder="4648" 
            className="h-12 rounded-xl text-center text-2xl tracking-[1em]"
            maxLength={4}
          />
        </Form.Item>

        <div className="space-y-3">
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            className="w-full h-12 rounded-xl bg-primary border-none shadow-lg shadow-primary/20 font-bold"
          >
            Verify & Login
          </Button>
          
          <Button 
            type="text" 
            icon={<RefreshCcw size={16} />}
            onClick={() => setStep('send')}
            className="w-full h-10 text-slate-500 flex items-center justify-center gap-2"
          >
            Back to Login
          </Button>
        </div>
      </Form>
    </div>
  );
};
