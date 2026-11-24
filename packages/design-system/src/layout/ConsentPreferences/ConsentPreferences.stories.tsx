import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../../primitives/Button';
import { ConsentPreferences } from './ConsentPreferences';

const meta: Meta<typeof ConsentPreferences> = {
  title: 'Layout/ConsentPreferences',
  component: ConsentPreferences,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ConsentPreferences>;

export const English: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    const [value, setValue] = useState({ analytics: true, marketing: false });

    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Open Cookie Preferences</Button>
        <ConsentPreferences
          open={open}
          onOpenChange={setOpen}
          value={value}
          onSave={setValue}
          texts={{
            title: 'Cookie Preferences',
            description: 'Manage how cookies are used on this site according to your privacy choices.',
            save: 'Save preferences',
            acceptAll: 'Accept all',
            rejectAll: 'Reject all',
            close: 'Close',
            alwaysActive: 'Always active',
          }}
        />
      </div>
    );
  },
};

export const Arabic: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    const [value, setValue] = useState({ analytics: false, marketing: false });

    return (
      <div dir="rtl" lang="ar" className="p-8">
        <Button onClick={() => setOpen(true)}>فتح تفضيلات ملفات تعريف الارتباط</Button>
        <ConsentPreferences
          open={open}
          onOpenChange={setOpen}
          value={value}
          onSave={setValue}
          texts={{
            title: 'تفضيلات ملفات تعريف الارتباط',
            description: 'يمكنك اختيار فئات ملفات تعريف الارتباط المسموح باستخدامها وفقاً لاختيارات الخصوصية.',
            save: 'حفظ التفضيلات',
            acceptAll: 'قبول الكل',
            rejectAll: 'رفض الكل',
            close: 'إغلاق',
            alwaysActive: 'دائماً نشطة',
          }}
          categories={[
            {
              id: 'necessary',
              label: 'ملفات الارتباط الضرورية',
              description: 'ملفات ارتباط أساسية لتشغيل وظائف الموقع وحمايته ولا يمكن تعطيلها.',
              locked: true,
            },
            {
              id: 'analytics',
              label: 'ملفات التحليلات والأداء',
              description: 'تساعدنا في فهم كيفية استخدام الزوار للموقع لتحسين الأداء والمحتوى.',
              locked: false,
            },
            {
              id: 'marketing',
              label: 'ملفات التسويق والإعلانات',
              description: 'تُستخدم لقياس فعالية الحملات التسويقية وتقديم إعلانات ملائمة.',
              locked: false,
            },
          ]}
        />
      </div>
    );
  },
};
