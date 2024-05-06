import React, { useState, useEffect, useRef } from "react";

interface InputSelectGenericProps {
  value: string;
  onChange: (value: string) => void;
  items: string[];
  placeholder?: string;
}

export function InputSelectGeneric({
  value,
  onChange,
  items,
  placeholder = "Digite ou selecione uma opção",
}: InputSelectGenericProps) {
  const [isListVisible, setIsListVisible] = useState(false);
  const [filteredItems, setFilteredItems] = useState<string[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Filtra os itens com base no valor de entrada
    let newFilteredItems = items.filter((item) => item.toLowerCase().includes(value.toLowerCase()));

    // Se o valor digitado não está na lista e não está vazio, adiciona à lista filtrada
    if (value && !items.includes(value)) {
      newFilteredItems = [value, ...newFilteredItems];
    }

    setFilteredItems(newFilteredItems);
  }, [value, items]);

  const handleBlur = () => {
    setTimeout(() => setIsListVisible(false), 100);
  };

  const handleSelectItem = (item: string) => {
    onChange(item);
    setIsListVisible(false);
  };

  return (
    <div className="w-full relative text-black">
      <input
        type="text"
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-md px-4 py-2 text-base"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        onFocus={() => setIsListVisible(true)}
      />
      {(isListVisible && filteredItems.length > 0) && (
        <div
          className="absolute z-30 w-full bg-white border border-gray-300 rounded-md mt-1 overflow-y-auto"
          style={{ maxHeight: "200px" }}
          ref={listRef}
        >
          {filteredItems.map((item, index) => (
            <div
              key={index}
              className="p-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelectItem(item)}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}