import React from "react";

interface CategoryNavProps {
  categories: {
    key: string;
    title: string;
    icon: React.ReactNode;
  }[];
  active: string;
  onSelect: (key: string) => void;
}

const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  active,
  onSelect,
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 border-b pb-4 mb-6">
      {categories.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onSelect(cat.key)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
            active === cat.key
              ? "!bg-cyan-600 !text-white shadow"
              : "!bg-gray-100 !text-gray-600 hover:!bg-gray-200"
          }`}
        >
          {cat.icon}
          <span className="text-sm font-medium">{cat.title}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryNav;
