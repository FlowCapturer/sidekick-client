import LinkWrapper from './LinkWrapper';

interface BigSquareProps {
  children: React.ReactNode;
  toPath: string;
  disabled?: boolean;
  className?: string;
}
const BigSquare = ({ children, toPath, disabled, className, ...props }: BigSquareProps) => {
  return (
    <LinkWrapper
      to={toPath}
      disabled={disabled}
      className={
        'h-40 p-5 w-60 border-2 border-primary rounded-4xl font-semibold flex flex-col justify-center hover:bg-accent ' +
        className
      }
      {...props}
    >
      {children}
    </LinkWrapper>
  );
};

export default BigSquare;
