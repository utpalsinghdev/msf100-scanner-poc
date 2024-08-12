/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Combobox } from "@headlessui/react";

function classNames(...classes:string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function ComboBox({
  people,
  onChange,
  value,
  name,
  label,
  placeholder,
  boxSize,
} :any) {
  const [query, setQuery] = useState("");
  const [selectedPerson, setSelectedPerson] = useState(null);

  const filteredPeople =
    query === ""
      ? people
      : people.filter((person :any) => {
          return person.name.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <Combobox
      as="div"
      className={boxSize || ""}
      value={people.find((person :any) => person.id === value) || selectedPerson}
      onChange={(e) => {
        onChange(e.id, name);
        setSelectedPerson(e);
      }}
    >
      <Combobox.Label className="block text-sm font-medium leading-6 text-gray-900">
        {label}
      </Combobox.Label>
      <div className="relative mt-2">
        <Combobox.Input
          placeholder={placeholder}
          className="w-full rounded-md border-0   bg-white  pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-indigo-400 focus:ring-2 focus:ring-inset focus:ring-green-800 sm:text-sm sm:leading-6"
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(person :any) => person?.name}
        />
        <Combobox.Button
          onClick={() => {
            if (query !== "") {
              setQuery("");
            }
          }}
          className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none"
        >
          <ChevronUpDownIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </Combobox.Button>

        {filteredPeople.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredPeople.map((person :any) => (
              <Combobox.Option
                key={person.id}
                value={person}
                className={() =>
                  classNames(
                    "relative cursor-default select-none py-2 pl-3 pr-9",
                    value === person.id
                      ? "bg-indigo-600 text-white"
                      : "text-gray-900"
                  )
                }
              >
                {() => {
                  return (
                    <>
                      <span
                        className={classNames(
                          "block truncate",
                            value === person.id
                                ? "text-white"
                                : "text-gray-900"
                        )}
                      >
                        {person.name}
                      </span>

                      {value === person.id && (
                        <span
                          className={classNames(
                            "absolute inset-y-0 right-0 flex items-center pr-4",
                            value === person.id
                              ? "text-white"
                              : "text-indigo-600"
                          )}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  );
                }}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
}
