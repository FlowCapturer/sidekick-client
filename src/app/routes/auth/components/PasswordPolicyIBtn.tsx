import InfoButton from '@/components/custom/InfoButton';

const PasswordPolicyIBtn = () => {
  return (
    <InfoButton side="right">
      <h5>Password Policy:</h5>
      <ul>
        <li>Password must be at least 8 characters long.</li>
        <li>Password must contain at least one uppercase letter.</li>
        <li>Password must contain at least one lowercase letter.</li>
        <li>Password must contain at least one number.</li>
        <li>Password must contain at least one special character.</li>
      </ul>
    </InfoButton>
  );
};

export default PasswordPolicyIBtn;
