import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Switch, Select, Button, message } from 'antd';
import { Save, Globe, BookOpen, UserCircle, BellRing } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const handleSave = () => {
    message.loading({ content: 'Saving settings...', key: 'settings' });
    setTimeout(() => {
      message.success({ content: 'Settings saved successfully!', key: 'settings' });
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader 
        title="Settings" 
        subtitle="Configure application preferences and administrative controls."
        extra={
          <Button 
            type="primary" 
            icon={<Save size={16} />} 
            onClick={handleSave}
            className="flex items-center gap-2 h-10 px-6 rounded-lg bg-primary border-none"
          >
            Save Changes
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6">
        <Card title="App Configuration" className="overflow-visible">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <BookOpen size={20} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Default Bible Version</p>
                  <p className="text-xs text-slate-400">Select which version users see by default.</p>
                </div>
              </div>
              <Select defaultValue="KJV" className="w-40 h-10">
                <Select.Option value="KJV">King James (KJV)</Select.Option>
                <Select.Option value="NIV">New International (NIV)</Select.Option>
                <Select.Option value="ESV">English Standard (ESV)</Select.Option>
                <Select.Option value="AMP">Amplified (AMP)</Select.Option>
              </Select>
            </div>

            <div className="border-t border-slate-50 pt-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <UserCircle size={20} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Profile Defaults</p>
                  <p className="text-xs text-slate-400">Set default mode for new user registrations.</p>
                </div>
              </div>
              <Select defaultValue="Adult" className="w-40 h-10">
                <Select.Option value="Kid">Kid Mode</Select.Option>
                <Select.Option value="Teen">Teen Mode</Select.Option>
                <Select.Option value="Adult">Adult Mode</Select.Option>
              </Select>
            </div>
          </div>
        </Card>

        <Card title="Notifications & Maintenance">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <BellRing size={20} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Global Notifications</p>
                  <p className="text-xs text-slate-400">Enable or disable system-wide push notifications.</p>
                </div>
              </div>
              <Switch defaultChecked rootClassName="custom-switch" />
            </div>

            <div className="border-t border-slate-50 pt-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <Globe size={20} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Maintenance Mode</p>
                  <p className="text-xs text-slate-400">Put the application into read-only mode for maintenance.</p>
                </div>
              </div>
              <Switch rootClassName="custom-switch" />
            </div>
          </div>
        </Card>

        <Card title="Danger Zone" className="border-rose-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-rose-800">Clear Cache</p>
              <p className="text-xs text-slate-400">Force clear all cached API responses and images.</p>
            </div>
            <Button danger ghost className="rounded-lg h-10 px-6">Clear Data</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
