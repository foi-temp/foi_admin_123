import { Table } from 'antd';
import type { TableProps } from 'antd';
import { Card } from './Card';
import { cn } from '../../utils/cn';

interface AppTableProps<T> extends TableProps<T> {
  containerClassName?: string;
}

export function AppTable<T extends object>({ 
  containerClassName, 
  className,
  ...props 
}: AppTableProps<T>) {
  return (
    <Card padding={false} className={cn("overflow-hidden", containerClassName)}>
      <Table 
        className={cn("modern-table", className)}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          className: "px-6 py-4 border-t border-slate-50",
          ...props.pagination,
        }}
        {...props} 
      />
    </Card>
  );
}
