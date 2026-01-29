import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useTheme from "@/hooks/useTheme";

const ThemeCmb = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Select
      value={theme}
      onValueChange={(newTheme) => {
        setTheme(newTheme);
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">Light</SelectItem>
        <SelectItem value="dark">Dark</SelectItem>
        <SelectItem value="system">System</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default ThemeCmb;
