type LogoProps = {
  className?: string;
};

export default function Logo({ className = "w-10 h-10" }: LogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M50 10C50 10 20 25 20 55C20 75 35 90 50 95C65 90 80 75 80 55C80 25 50 10 50 10Z"
        fill="url(#leafGradient)"
        stroke="#22c55e"
        strokeWidth="2"
      />
      <path
        d="M50 15L50 90"
        stroke="#16a34a"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M50 30L35 40"
        stroke="#16a34a"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M50 45L30 55"
        stroke="#16a34a"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M50 60L35 68"
        stroke="#16a34a"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M50 30L65 40"
        stroke="#16a34a"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M50 45L70 55"
        stroke="#16a34a"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M50 60L65 68"
        stroke="#16a34a"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <defs>
        <linearGradient
          id="leafGradient"
          x1="50"
          y1="10"
          x2="50"
          y2="95"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="50%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
      </defs>
    </svg>
  );
}
