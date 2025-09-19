// src/components/common/LoadingSpinner.tsx
import React from "react";

type LoadingSpinnerProps = {
  size?: number; // default 40px
  fullScreen?: boolean;
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  fullScreen = false,
}) => {
  const spinner = (
    <div
      className="rounded-full animate-spin"
      style={{
        width: size,
        height: size,
        borderWidth: size / 8,
        borderStyle: "solid",
        borderColor: "transparent",
        borderTopColor: "transparent",
        backgroundImage:
          "conic-gradient(red, orange, yellow, lime, cyan, blue, violet, magenta, red)",
        mask: "radial-gradient(farthest-side, transparent calc(100% - 6px), black 0)",
        WebkitMask:
          "radial-gradient(farthest-side, transparent calc(100% - 6px), black 0)",
      }}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
