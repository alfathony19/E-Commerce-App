import React from "react";
import { Card, CardContent } from "../ui/card";
import { Star } from "lucide-react"; // untuk icon bintang

export interface CategoryCardProps {
  id?: string;
  title: string;
  description: string;
  count?: number;
  icon?: React.ReactNode;
  price?: number;
  promoPrice?: number;
  rating?: number;
  category?: string;
  image?: string; // Firestore URL
  large?: boolean;
}

const formatIDR = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  description,
  price,
  promoPrice,
  rating,
  category,
  image,
}) => {
  const hasPrice = typeof price === "number";
  const hasPromo =
    typeof promoPrice === "number" &&
    typeof price === "number" &&
    promoPrice < price;

  return (
    <Card className="rounded-xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden">
      <CardContent className="flex gap-4 p-4">
        {/* FOTO KIRI */}
        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
          {image && image.trim() !== "" ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full img-fluid object-cover object-center"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/150?text=No+Image";
              }}
            />
          ) : (
            <span className="text-xs text-gray-400">No Img</span>
          )}
        </div>

        {/* INFO KANAN */}
        <div className="flex-1 flex flex-col">
          {/* Judul + kategori */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold line-clamp-1">{title}</h3>
            {category && (
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-600">
                {category}
              </span>
            )}
          </div>

          {/* Deskripsi (justify) */}
          <p className="text-gray-500 text-xs line-clamp-2 text-justify">
            {description}
          </p>

          {/* Harga (rapiin promo) */}
          {hasPrice && (
            <div className="mt-2 flex items-center gap-2">
              {hasPromo ? (
                <>
                  <span className="text-sm font-bold text-red-500">
                    {formatIDR(promoPrice!)}
                  </span>
                  <span className="text-xs text-gray-400 line-through">
                    {formatIDR(price!)}
                  </span>
                </>
              ) : (
                <span className="text-sm font-bold text-red-500">
                  {formatIDR(price!)}
                </span>
              )}
            </div>
          )}

          {/* Rating */}
          {typeof rating === "number" && (
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < Math.round(rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }
                />
              ))}
              <span className="text-xs text-gray-500">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
