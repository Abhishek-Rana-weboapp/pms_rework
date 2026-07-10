import { cn } from "@/shared/lib/utils";
import React from "react";

const Wrapper = ({ children, className, ...props }) => {
  return (
    <div className="h-full overflow-y-auto scrollbar-gutter-stable">
      <div className={cn("w-full md:p-10 p-4 md:py-5 mx-auto ", className)} {...props}>
        {children}
      </div>
    </div>
  );
};

export default Wrapper;
