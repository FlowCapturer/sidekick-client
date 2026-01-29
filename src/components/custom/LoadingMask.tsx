import LoadingCmp from './LoadingCmp';

const LoadingMask = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <LoadingCmp /> &nbsp;Loading...
    </div>
  );
};

export default LoadingMask;
