import { CheckIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export function WizardStepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center">
      {steps.map((label, i) => (
        <div key={label} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                i < current ? "bg-mint-500 text-white" : i === current ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-400"
              )}
            >
              {i < current ? <CheckIcon className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn("mt-1.5 hidden text-xs font-medium sm:block", i === current ? "text-ink-900" : "text-ink-400")}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && <div className={cn("mx-2 h-px flex-1", i < current ? "bg-mint-400" : "bg-ink-100")} />}
        </div>
      ))}
    </div>
  );
}
