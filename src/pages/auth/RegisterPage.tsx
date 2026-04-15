import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { Phone, User, ArrowRight, Lock, RefreshCcw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { useAdminStore } from '../../store/useAdminStore';

export const RegisterPage: React.FC = () => {
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const setAuth = useAdminStore((state) => state.setAuth);

  const handleRegister = async (values: any) => {
    setLoading(true);
    try {
      const res: any = await authApi.setupSuperAdmin(values);
      message.success(res.message || 'Registration successful! OTP sent.');
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
      message.success('Account activated successfully!');
      navigate('/');
    } catch (err) {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  if (step === 'register') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-slate-800">Setup Admin</h3>
          <p className="text-slate-500 text-sm">Create your super admin account</p>
        </div>

        <Form form={form} layout="vertical" onFinish={handleRegister} initialValues={{ role: 'super_admin' }} className="mt-8">
          <Form.Item 
            name="full_name" 
            label="Full Name" 
            rules={[{ required: true, message: 'Please enter your full name' }]}
          >
            <Input 
              prefix={<User size={18} className="text-slate-400 mr-2" />} 
              placeholder="John Doe" 
              className="h-12 rounded-xl"
            />
          </Form.Item>

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

          <Form.Item name="role" label="Role" hidden>
            <Input />
          </Form.Item>

          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            className="w-full h-12 rounded-xl bg-primary border-none shadow-lg shadow-primary/20 flex items-center justify-center gap-2 font-bold"
          >
            Create Account <ArrowRight size={18} />
          </Button>
        </Form>

        <p className="text-center text-sm text-slate-500 mt-4">
          Already an admin? <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-slate-800">Activate Account</h3>
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
            Activate & Login
          </Button>
          
          <Button 
            type="text" 
            icon={<RefreshCcw size={16} />}
            onClick={() => setStep('register')}
            className="w-full h-10 text-slate-500 flex items-center justify-center gap-2"
          >
            Back to Registration
          </Button>
        </div>
      </Form>
    </div>
  );
};
