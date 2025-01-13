import React from "react";
import { useMappedStore } from "../../store/use-mapped-store";

interface Props {
  onClick: () => void;
}

export function NavbarMainSidebarToggle({ onClick }: Props) {
  const { global } = useMappedStore();

  return (
    <div className="h-[40px] min-w-[60px] pl-[30px] cursor-pointer relative">
      <div className="absolute flex gap-1 flex-col top-3.5 left-0" onClick={onClick}>
        <span className="w-[20px] h-[2px] bg-gray-400 dark:bg-gray-700" />
        <span className="w-[20px] h-[2px] bg-gray-400 dark:bg-gray-700" />
        <span className="w-[20px] h-[2px] bg-gray-400 dark:bg-gray-700" />
      </div>
      <a href="/">
        <img
          src={`https://images.hive.blog/u/${global.hive_id}/avatar`}
          className="logo relative min-w-[40px] max-w-[40px]"
          alt="Logo"
          style={{ borderRadius: "50%" }}
        />
      </a>
    </div>
  );
}
