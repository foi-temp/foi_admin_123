import apiClient from './apiClient';

export interface SetupAdminPayload {
  phone_number: string;
  full_name: string;
  role: 'super_admin' | 'admin';
}

export interface VerifyOtpPayload {
  phone_number: string;
  otp_code: string;
}

export interface SendOtpPayload {
  phone_number: string;
}

export const authApi = {
  setupSuperAdmin: (payload: SetupAdminPayload) => 
    apiClient.post('/admin/setup-super-admin', payload),
    
  verifyOtp: (payload: VerifyOtpPayload) => 
    apiClient.post('/admin/verify-otp', payload),
    
  sendOtp: (payload: SendOtpPayload) => 
    apiClient.post('/admin/send-otp', payload),
};
