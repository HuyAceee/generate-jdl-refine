import { useGetLocale, useSetLocale } from '@refinedev/core';
import { Button, Popover } from 'antd';
import React, { useMemo, useState } from 'react';

import SvgIcon from '../SvgIcon';

const languages = [
  { key: 'vi', label: 'Tiếng Việt', flag: 'ic-flag-vi' },
  { key: 'en', label: 'English', flag: 'ic-flag-en' },
];

const LanguagePopover: React.FC = () => {
  const getLocale = useGetLocale();
  const setLocale = useSetLocale();
  const currentLocale = getLocale();
  const [open, setOpen] = useState(false);

  const handleChangeLanguage = (lang: string) => {
    setLocale(lang);
    setOpen(false);
  };

  const content = (
    <div>
      {languages.map(lang => (
        <div
          key={lang.key}
          onClick={() => handleChangeLanguage(lang.key)}
          className="flex cursor-pointer items-center gap-2 p-1"
        >
          <SvgIcon name={lang.flag} height={22} />
          <span>{lang.label}</span>
        </div>
      ))}
    </div>
  );

  const flag = useMemo(() => {
    return languages.find(lang => lang.key === currentLocale)?.flag ?? '';
  }, [currentLocale]);

  return (
    <Popover content={content} trigger="hover" open={open} onOpenChange={setOpen}>
      <Button className="flex items-center border-none bg-transparent p-0 shadow-none">
        <SvgIcon name={flag} height={22} className="mt-1" />
      </Button>
    </Popover>
  );
};

export default LanguagePopover;
