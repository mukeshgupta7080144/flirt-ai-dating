import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      <path d="M7 3V2" />
      <path d="M17 3V2" />
      <path d="M12 3V2" />

      <path d="M22 8h-1" />
      <path d="M3 8H2" />
      
      <path d="M20 13h-1" />
      <path d="M5 13H4" />
      
      <path d="M17 21v-1" />
      <path d="M7 21v-1" />
       <path d="M12 22v-1" />

       <path d="M4.929 4.929l.707.707"/>
       <path d="M18.364 18.364l.707.707"/>
       <path d="M18.364 4.929l.707-.707"/>
       <path d="M4.929 18.364l.707-.707"/>

    </svg>
  );
}
