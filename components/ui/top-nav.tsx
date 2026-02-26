import { ThemeToggle } from "@/components/ui/theme-toggle";

export function TopNav() {
  return (
    <header className="top-nav">
      <span className="top-nav-brand">Dayne</span>
      <ThemeToggle />
    </header>
  );
}
