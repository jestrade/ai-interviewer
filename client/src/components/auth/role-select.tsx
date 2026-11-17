import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_GROUPS } from "@/lib/constants";

export const RoleSelect = ({ onChange }: { onChange: (role: string) => void }) => (
  <div className="text-sm text-muted-foreground text-center mb-2 p-4">
    <label id="role-label">Select the role you are applying for:</label>
    <Select onValueChange={onChange}>
      <SelectTrigger className="w-full mt-2" aria-labelledby="role-label">
        <SelectValue placeholder="Select a role" />
      </SelectTrigger>
      <SelectContent>
        {ROLE_GROUPS.map((group) => (
          <SelectGroup key={group.id}>
            <SelectLabel className="text-muted-foreground">{group.label}</SelectLabel>
            {Object.entries(group.roles).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  </div>
);
