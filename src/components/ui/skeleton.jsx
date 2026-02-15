import React from "react";

function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200/80 ${className}`}
      {...props}
    />
  );
}

export { Skeleton };