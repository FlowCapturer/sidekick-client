import { NavLink, type NavLinkProps } from 'react-router';

interface ILinkWrapper {
  className?: string;
  disabled?: boolean;
  removeAllStyles?: boolean;
}

const LocalEmptySpan = ({ ...props }) => <span {...props} />;

const LinkWrapper = ({ className, disabled, removeAllStyles = false, ...props }: ILinkWrapper & NavLinkProps) => {
  const CustomComponent = disabled ? LocalEmptySpan : NavLink;

  const systemCls = disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:underline';

  return <CustomComponent className={(className || '') + ' ' + (removeAllStyles ? '' : systemCls)} {...props} />;
};

export default LinkWrapper;
