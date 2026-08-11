import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        style: {
          backgroundColor: "var(--glass-bg)",
          backdropFilter: "blur(16px) saturate(150%)",
          WebkitBackdropFilter: "blur(16px) saturate(150%)",
          transform: "translateZ(0)",
          border: "1px solid var(--glass-border)",
          boxShadow:
            "inset 0 1px 1px var(--glass-highlight), 0 16px 40px -12px var(--glass-shadow)",
          borderRadius: "var(--radius-3xl)",
          color: "var(--color-foreground)",
        },
        classNames: {
          toast: "group toast",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
