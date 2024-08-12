/* eslint-disable @typescript-eslint/no-explicit-any */
export const enums = {
  GRAY: "GRAY",
  RED: "RED",
  GREEN: "GREEN",
  BLUE: "BLUE",
};
function Badge({ children, type, ...rest }:any) {
  const badges = [
    {
      color: "GRAY",
      comp: (
        <span
          {...rest}
          className="inline-flex cursor-pointer items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600"
        >
          {children}
        </span>
      ),
    },
    {
      color: "RED",
      comp: (
        <span
          {...rest}
          className="inline-flex cursor-pointer items-center rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700"
        >
          {children}
        </span>
      ),
    },
    {
      color: "GREEN",
      comp: (
        <span
          {...rest}
          className="inline-flex cursor-pointer items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
        >
          {children}
        </span>
      ),
    },
    {
      color: "BLUE",
      comp: (
        <span
          {...rest}
          className="inline-flex cursor-pointer items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
        >
          {children}
        </span>
      ),
    },
  ];
  return (
    <div>
      {badges
        .filter((b) => b.color === type)
        ?.map((badge, index) => (
          <div key={index}>{badge.comp}</div>
        ))}
      {/* <span className="inline-flex items-center rounded-md bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
        Badge
      </span>

      <span className="inline-flex items-center rounded-md bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700">
        Badge
      </span>
      <span className="inline-flex items-center rounded-md bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
        Badge
      </span>
      <span className="inline-flex items-center rounded-md bg-pink-100 px-2 py-1 text-xs font-medium text-pink-700">
        Badge
      </span> */}
    </div>
  );
}
export default Badge;
