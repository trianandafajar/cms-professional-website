// src/components/ui/tags-input.tsx

'use client'

import * as React from 'react'

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox'

interface TagsInputProps {
  value?: string[]
  options: string[]
  placeholder?: string
  max?: number
}

export function TagsInput({
  value = [],
  options,
  placeholder = 'Add search keywords to your event',
  max = 10,
}: TagsInputProps) {
  const anchor = useComboboxAnchor()

  return (
    <div>
      <Combobox multiple autoHighlight items={options} defaultValue={value}>
        <ComboboxChips
          ref={anchor}
          className="
            min-h-45
            w-full
            rounded-3xl
            border
            border-gray-300
            bg-white
            p-4
            focus-within:border-blue-500
            focus-within:ring-4
            focus-within:ring-blue-500/10
          "
        >
          <ComboboxValue>
            {(values: string[]) => (
              <>
                {values.map((value) => (
                  <ComboboxChip
                    key={value}
                    className="rounded-full bg-gray-100 py-2 px-4 text-smfont-medium "
                  >
                    {value}
                  </ComboboxChip>
                ))}

                <ComboboxChipsInput
                  placeholder={values.length === 0 ? placeholder : ''}
                  className="
                    px-4
                    min-w-45
                    flex-1
                    border-0
                    bg-transparent
                    text-base
                    outline-none
                  "
                />
              </>
            )}
          </ComboboxValue>

          <div className="mt-auto w-full pt-4  px-4 text-sm text-gray-500">{placeholder}</div>
        </ComboboxChips>

        <ComboboxContent
          anchor={anchor}
          className="
            mt-2
            w-(--radix-popper-anchor-width)
            overflow-hidden
            rounded-2xl
            border
            border-gray-200
            bg-white
            shadow-xl
          "
        >
          <ComboboxEmpty>No tags found</ComboboxEmpty>

          <ComboboxList>
            {(item) => (
              <ComboboxItem
                key={item}
                value={item}
                className="
                  px-4
                  py-3
                  hover:bg-blue-50
                "
              >
                <div>
                  <div className="font-medium">{item}</div>

                  <div className="text-xs text-gray-500">Suggested tag</div>
                </div>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      <p className="mt-3 text-sm text-gray-500">
        {value.length}/{max} tags
      </p>
    </div>
  )
}
