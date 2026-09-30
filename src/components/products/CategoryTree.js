import React, { useState } from 'react';
import { FaCheck, FaChevronDown, FaChevronRight } from 'react-icons/fa';

// One category and, under it (opened with its own 44 px chevron), its children. Choosing one chooses it and everything under it
// (the backend's `category` includes the child categories); choosing the chosen one again takes it off. Declared here, not inside
// the panel: a component declared in a render is a new component every render and would forget what it had opened.
const CategoryNode = ({ category, selected, opened, onSelect }) => {
  const children = category.children || [];
  const [open, setOpen] = useState(opened.includes(category.slug));
  const chosen = selected === category.slug;
  return (
    <li>
      <div className="flex items-center">
        <button
          type="button"
          aria-pressed={chosen}
          onClick={() => onSelect(chosen ? null : category.slug)}
          className={`flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-lg px-2 text-left ${chosen ? 'bg-blue-50 font-semibold text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
        >
          {chosen && <FaCheck aria-hidden="true" className="shrink-0 text-sm" />}
          <span className="min-w-0 break-words">{category.name}</span>
        </button>
        {children.length > 0 && (
          <button
            type="button"
            aria-expanded={open}
            aria-label={`${open ? 'Hide' : 'Show'} ${category.name} subcategories`}
            onClick={() => setOpen((value) => !value)}
            className="flex h-11 w-11 shrink-0 items-center justify-center text-gray-500 hover:text-blue-600"
          >
            {open ? <FaChevronDown aria-hidden="true" /> : <FaChevronRight aria-hidden="true" />}
          </button>
        )}
      </div>
      {open && children.length > 0 && (
        <ul className="ml-3 border-l border-gray-200 pl-2">
          {children.map((child) => (
            <CategoryNode key={child.slug} category={child} selected={selected} opened={opened} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </li>
  );
};

// The shop's categories as a tree, no box to scroll inside (the panel scrolls); the path down to the chosen one is open
const CategoryTree = ({ categories, selected, opened, onSelect }) => (
  <ul>
    {categories.map((category) => (
      <CategoryNode key={category.slug} category={category} selected={selected} opened={opened} onSelect={onSelect} />
    ))}
  </ul>
);

export default CategoryTree;
