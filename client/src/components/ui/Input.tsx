import { ComponentProps } from "react";

interface InputProps extends ComponentProps<"input"> {
  label?: string;
  error?: string;
}

export const Input = ({
  label,
  error,
  className = "",
  ...props
}: InputProps) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={`
          w-full rounded border px-3 py-2
          focus:outline-none focus:ring-2
          ${error ? "border-red-500" : "border-gray-300"}
          ${className}
        `.trim()}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};
