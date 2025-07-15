// src/components/ui/Label.tsx
import * as React from "react";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}
      {...props}
    />
  );
}

export default Label;