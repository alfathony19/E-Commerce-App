import React, { useEffect, useRef, useState } from "react";
import { useCategories } from "../../../hooks/useCategories";
import CategoryCard from "../../ui/CategoryCard";

const CategoryPreviews: React.FC = () => {
  const { categories, loading } = useCategories();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [direction, setDirection] = useState<"right" | "left">("right");

  useEffect(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;

    // aktifkan auto-slide hanya di HP
    if (window.innerWidth >= 768) return;

    const interval = setInterval(() => {
      if (!container) return;
      const step = 180; // ukuran card + gap

      if (direction === "right") {
        if (
          container.scrollLeft + container.clientWidth >=
          container.scrollWidth - 10
        ) {
          setDirection("left"); // mentok kanan
        } else {
          container.scrollBy({ left: step, behavior: "smooth" });
        }
      } else {
        if (container.scrollLeft <= 0) {
          setDirection("right"); // mentok kiri
        } else {
          container.scrollBy({ left: -step, behavior: "smooth" });
        }
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [direction]);

  if (loading) return <p>Loading categories...</p>;
  if (!categories || categories.length === 0)
    return <p>No categories found.</p>;

  return (
    <section className="my-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Shop by Category</h2>
        <a
          href="/categories"
          className="text-sm !text-purple-600 hover:underline"
        >
          Browse all categories →
        </a>
      </div>

      {/* ✅ sekarang bisa manual scroll + auto slide di HP */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scroll-smooth"
        style={{
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE & Edge
        }}
      >
        <style>
          {`
      div::-webkit-scrollbar {
        display: none;
      }
    `}
        </style>

        {categories.map((cat) => (
          <div key={cat.id} className="flex-shrink-0 w-40">
            <CategoryCard
              name={cat.name}
              imageUrl={cat.imageUrl || "/images/default-category.png"} // fallback biar ga abu²
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoryPreviews;
