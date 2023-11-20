export const Button = ({
  children,
  onClick,
  className,
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  props?: any;
}) => (
  <button
    className={`bg-[#242424] border border-[#323232] rounded-[15px] p-5 py-2 text-[16px] ${className}`}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);
