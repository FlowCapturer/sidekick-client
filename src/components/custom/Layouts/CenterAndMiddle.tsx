const CenterAndMiddle = ({ className = '', children }: { className?: string; children: React.ReactNode }) => {
  return <div className={`flex-1 flex items-center justify-center ${className}`}>{children}</div>;
};

export default CenterAndMiddle;
