import { SelectListWrapper } from '@/components/custom';
import { ROLES } from '@/lib/enums';

interface IRolesCmb {
  value: string;
  setValue: (value: string) => void;
  id: string;
}

const RolesCmb = ({ value, setValue, id }: IRolesCmb) => {
  return (
    <SelectListWrapper
      valueField="id"
      labelField="text"
      placeholder="Specify Role"
      items={ROLES.GET_LIST()}
      value={value}
      onValueChange={(value) => {
        setValue(value);
      }}
      triggerClassName="w-[180px]"
      id={id}
    />
  );
};

export default RolesCmb;
