export const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`
        bg-white/50
        backdrop-blur-sm 
        border border-white/30 
        rounded-2xl 
        shadow-[0_20px_40px_rgba(0,0,0,0.15)]
        transition-all duration-300
        hover:shadow-[0_30px_60px_rgba(0,0,0,0.25)]
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`
        px-6 py-4 
        border-b border-white/30
        bg-white/30
        backdrop-blur-sm
        rounded-t-2xl
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`p-6 text-gray-800 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3
      className={`text-xl font-semibold text-gray-800 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription = ({ children, className = '', ...props }) => {
  return (
    <p
      className={`text-sm text-gray-600 mt-1 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};

export default Card;
