import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Sparkles,
  TrendingUp,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SortOption = "newest" | "price_asc" | "price_desc" | "popular";

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const sortOptions: Array<{
  value: SortOption;
  label: string;
  icon: React.ElementType;
}> = [
  {
    value: "newest",
    label: "Newest First",
    icon: Sparkles,
  },
  {
    value: "price_asc",
    label: "Price: Low to High",
    icon: ArrowUp,
  },
  {
    value: "price_desc",
    label: "Price: High to Low",
    icon: ArrowDown,
  },
  {
    value: "popular",
    label: "Most Popular",
    icon: TrendingUp,
  },
];

const SortDropdown = ({ value, onChange }: SortDropdownProps) => {
  const [open, setOpen] = useState(false);
  const selectedOption = sortOptions.find((opt) => opt.value === value) || sortOptions[0];
  const SelectedIcon = selectedOption.icon;

  const handleSelect = (optionValue: SortOption) => {
    onChange(optionValue);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-10 px-4 gap-2.5 rounded-full border-0 backdrop-blur-sm transition-all duration-300 flex-shrink-0 shadow-sm hover:shadow-md",
            "bg-background/80 text-muted-foreground hover:text-foreground hover:bg-background/90"
          )}
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          <span className="text-sm font-medium">Sort by</span>
          <SelectedIcon className="h-3.5 w-3.5 text-accent" />
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {selectedOption.label}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className={cn(
          "w-56 p-2 rounded-xl border border-border/40 shadow-xl backdrop-blur-xl bg-background/98",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=bottom]:slide-out-to-top-2",
          "data-[side=top]:slide-in-from-bottom-2 data-[side=top]:slide-out-to-bottom-2",
          "duration-200 ease-out"
        )}
      >
        {sortOptions.map((option, index) => {
          const Icon = option.icon;
          const isSelected = value === option.value;

          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => handleSelect(option.value)}
              className={cn(
                "flex items-center gap-3 px-3 py-3 cursor-pointer rounded-lg transition-all duration-200",
                "hover:bg-muted/60 focus:bg-muted/60 active:scale-[0.98]",
                isSelected && "bg-accent/10 border border-accent/20",
                index !== sortOptions.length - 1 && "mb-0.5"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors duration-200 flex-shrink-0",
                  isSelected ? "text-accent" : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "flex-1 text-sm font-medium transition-colors duration-200",
                  isSelected ? "text-foreground font-semibold" : "text-muted-foreground"
                )}
              >
                {option.label}
              </span>
              {isSelected && (
                <Check className="h-4 w-4 text-accent transition-all duration-200 flex-shrink-0" strokeWidth={3} />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SortDropdown;

