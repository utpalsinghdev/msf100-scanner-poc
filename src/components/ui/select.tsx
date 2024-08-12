/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from "@/lib/utils";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import { Label } from "./label";
function Select(props: any) {
  const {
    id,
    label,
    name,
    error,
    required,
    className,
    children,
    ...rest
  } = props;
  return (
    <div className="w-full">
      <Label className="ml-1 flex flex-row gap-0 w-full">
        {label}{" "}
      </Label>
      <div className="relative mt-2 rounded-md shadow-sm">
        <select
          id={id || name}
          name={name}
          required={required}
          className={cn(
            "block w-full rounded-md text-black border-0 py- pl-8  ring-1 ring-gray-300 ring-inset  ",
            error
              ? "ring-red-300  focus:ring-2 focus:ring-inset focus:ring-red-500"
              : "ring-indigo-300  focus:ring-2 focus:ring-inset focus:ring-blue-500",
            className
          )}
          {...rest}
        >
          {children}
        </select>
      </div>
      {error && (
        <p className=" text-sm text-red-600" id="error">
          {error}
        </p>
      )}
    </div>
  );
}
Select.defaultProps = {
  id: "name",
  label: "Email",
  placeholder: "Enter Your Email Address",
  type: "text",
  name: "name",
  error: null,
  required: false,
  icon: (
    <ExclamationCircleIcon
      className="h-5 w-5 text-indigo-500"
      aria-hidden="true"
    />
  ),
};

export default Select;
