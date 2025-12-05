import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
};

export default function ButtonPremium({ variant="solid", size="md", children, ...rest }: Props){
  const base = "font-semibold rounded-xl-3 transition-transform active:scale-[0.995]";
  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-5 py-3 text-base",
    lg: "px-6 py-4 text-lg"
  };
  const styles = {
    solid: "bg-solventis-indigo text-white shadow-soft-2025 hover:brightness-105",
    ghost: "bg-transparent text-solventis-indigo border border-solventis-indigo/10",
    outline: "bg-white border border-gray-200 text-solventis-ink"
  };
  
  return (
    <button 
      className={`${base} ${sizes[size]} ${styles[variant]}`} 
      {...rest}
    >
      {children}
    </button>
  );
}
