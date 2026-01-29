import type { JSX } from 'react';

interface HeaderTextProps {
  children: string | JSX.Element;
}

const HeaderText = ({ children }: HeaderTextProps) => {
  return <h3 className="text-lg font-medium">{children}</h3>;
};

export default HeaderText;
