import React from "react";

type SidebarItem = {
  key: string;
  label: string;
  icon?: React.ReactNode;
};

type Props = {
  items: SidebarItem[];
  onSelect: (key: string) => void;
};

export default function SidebarPremium({ items, onSelect }: Props) {
  return (
    <aside className="w-72 hidden lg:block border-r bg-white h-full py-6 px-4">
      <img src="/logo-altusfinances.png" className="h-10 mb-6" alt="Altus Finances Group" data-testid="img-sidebar-logo" />

      <nav className="flex flex-col gap-2">
        {items.map(i => (
          <button 
            key={i.key} 
            onClick={() => onSelect(i.key)}
            className="text-left py-3 px-3 rounded-lg hover:bg-gray-50 flex items-center gap-3"
            data-testid={`button-sidebar-${i.key}`}
          >
            {i.icon}
            <span className="font-medium text-sm">{i.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
