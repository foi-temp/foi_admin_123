import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/common/Card';
import { Button } from 'antd';
import { Plus } from 'lucide-react';

interface ModulePlaceholderProps {
  name: string;
}

export const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({ name }) => {
  return (
    <div>
      <PageHeader 
        title={name} 
        subtitle={`Manage and oversee your ${name.toLowerCase()} content.`}
        extra={
          <Button type="primary" icon={<Plus size={16} />} className="flex items-center gap-2 h-10 px-4 rounded-lg">
            Add New {name}
          </Button>
        }
      />
      <Card>
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <p className="text-lg font-medium">{name} Module is under construction</p>
          <p className="text-sm">We are working on bringing this feature to you soon.</p>
        </div>
      </Card>
    </div>
  );
};
