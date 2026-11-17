import { Briefcase, Code2, Crown, Factory, KanbanSquare, type LucideIcon } from "lucide-react";
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

const GROUP_ICONS: Record<string, LucideIcon> = {
  engineering: Code2,
  management: KanbanSquare,
  leadership: Crown,
  oil: Factory,
};

export const RoleSelect = ({ onChange }: { onChange: (role: string) => void }) => (
  <div className="text-sm text-muted-foreground text-center mb-2 p-4">
    <label id="role-label" className="flex items-center justify-center gap-2 font-bold">
      <Briefcase className="w-4 h-4" aria-hidden="true" />
      Select the role you are applying for
    </label>
    <Select onValueChange={onChange}>
      <SelectTrigger className="w-full mt-2" aria-labelledby="role-label">
        <SelectValue placeholder="Select a role" />
      </SelectTrigger>
      <SelectContent>
        {ROLE_GROUPS.map((group) => {
          const Icon = GROUP_ICONS[group.id] ?? Briefcase;
          return (
            <SelectGroup key={group.id}>
              <SelectLabel className="flex items-center gap-2 text-muted-foreground">
                <Icon className="w-4 h-4" aria-hidden="true" />
                {group.label}
              </SelectLabel>
              {Object.entries(group.roles).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectGroup>
          );
        })}
      </SelectContent>
    </Select>
  </div>
);
