import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// interface IItem {
//   value: string;
//   label: string;
// }

interface ISelectListWrapper {
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  triggerClassName?: string;
  valueField?: string;
  labelField?: string;
  items: Record<string, unknown>[];
  id?: string;
}

const SelectListWrapper = ({
  placeholder,
  items,
  value,
  onValueChange,
  triggerClassName = 'w-[180px]',
  valueField = 'value',
  labelField = 'label',
  id,
  ...props
}: ISelectListWrapper) => {
  return (
    <Select
      value={value}
      onValueChange={(newValue: string) => {
        onValueChange?.(newValue);
      }}
    >
      <SelectTrigger className={triggerClassName} {...props} id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item[valueField] as string} value={item[valueField] as string}>
            {item[labelField] as string | React.ReactNode}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SelectListWrapper;
