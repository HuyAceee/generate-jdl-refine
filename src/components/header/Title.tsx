import { Link } from '@refinedev/core';
import { FC } from 'react';

interface SidebarButtonProps {
  collapsed: boolean;
}

const SidebarButton: FC<SidebarButtonProps> = ({ collapsed }) => {
  return (
    <Link to="/" className="flex items-center gap-2">
      <div className="flex size-10 items-center justify-center">
        <img src="/favicon.ico" alt="" />
      </div>

      {!collapsed && (
        <div className="flex flex-col gap-0">
          <h1 className="font-bold text-gray-800 lg:text-base">Aladin Technology</h1>
          <div className="text-gray-600 lg:text-sm ">Successful Friend</div>
        </div>
      )}
    </Link>
  );
};

export default SidebarButton;
