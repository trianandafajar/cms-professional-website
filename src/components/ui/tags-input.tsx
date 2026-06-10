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
  onValueChange?: (value: string[]) => void
}

export function TagsInput({
  value = [],
  options,
  placeholder = 'Add search keywords to your event',
  max = 10,
  onValueChange,
}: TagsInputProps) {
  const anchor = useComboboxAnchor()
  const [inputValue, setInputValue] = React.useState('')

  const normalizedOptions = React.useMemo(() => {
    return Array.from(new Set(options.map((item) => item.trim()).filter(Boolean)))
  }, [options])

  const availableOptions = React.useMemo(() => {
    const typedValue = inputValue.trim()

    if (!typedValue) {
      return normalizedOptions
    }

    const exists = normalizedOptions.some(
      (option) => option.toLowerCase() === typedValue.toLowerCase(),
    )

    if (exists) {
      return normalizedOptions
    }

    return [typedValue, ...normalizedOptions]
  }, [inputValue, normalizedOptions])

  const addTag = React.useCallback(
    (rawValue: string) => {
      const nextTag = rawValue.trim()
      if (!nextTag || value.length >= max) return

      const alreadySelected = value.some((item) => item.toLowerCase() === nextTag.toLowerCase())
      if (alreadySelected) {
        setInputValue('')
        return
      }

      onValueChange?.([...value, nextTag])
      setInputValue('')
    },
    [max, onValueChange, value],
  )

  return (
    <div>
      <Combobox
        multiple
        autoHighlight
        items={availableOptions}
        value={value}
        onValueChange={onValueChange}
        inputValue={inputValue}
        onInputValueChange={setInputValue}
      >
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
                    className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium"
                  >
                    {value}
                  </ComboboxChip>
                ))}

                <ComboboxChipsInput
                  placeholder={values.length === 0 ? placeholder : ''}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ',') {
                      event.preventDefault()
                      addTag(inputValue)
                    }
                  }}
                  className="
                    px-4
                    min-w-28
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

          <div className="mt-auto w-full px-4 pt-4 text-sm text-gray-500">
            Press Enter to add a custom tag
          </div>
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

                  <div className="text-xs text-gray-500">
                    {normalizedOptions.some(
                      (option) => option.toLowerCase() === item.toLowerCase(),
                    )
                      ? 'Suggested tag'
                      : 'Press Enter to add this tag'}
                  </div>
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
