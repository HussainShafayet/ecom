import React from 'react';

// Colour swatches and size chips of a product. 40 px targets, the chosen name written out (a phone has no hover tooltip), and
// a size that is sold out struck through but still selectable, so the page can say it is out of stock.
const ProductOptions = ({ product, selectedColor, selectedSize, onSelectColor, onSelectSize }) => {
  const colors = product?.colors || [];
  const sizes = selectedColor?.sizes?.length > 0 ? selectedColor.sizes : (product?.sizes || []);
  if (colors.length === 0 && sizes.length === 0) return null;

  return (
    <div className="space-y-4">
      {colors.length > 0 && (
        <div>
          <p className="mb-2 text-sm text-gray-600">Color: <span className="font-semibold text-gray-900">{selectedColor?.name}</span></p>
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => {
              const chosen = selectedColor?.name === color?.name;
              return (
                <button
                  key={color?.name}
                  type="button"
                  onClick={() => onSelectColor(color)}
                  aria-label={color?.name}
                  aria-pressed={chosen}
                  title={color?.name}
                  style={{ backgroundColor: color?.hex_code }}
                  className={`h-10 w-10 rounded-full border-2 transition-transform ${chosen ? 'scale-110 border-blue-600 ring-2 ring-blue-200' : 'border-gray-300'}`}
                />
              );
            })}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div>
          <p className="mb-2 text-sm text-gray-600">Size: <span className="font-semibold text-gray-900">{selectedSize?.name}</span></p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const chosen = selectedSize?.name === size?.name;
              return (
                <button
                  key={size?.name}
                  type="button"
                  onClick={() => onSelectSize(size)}
                  aria-pressed={chosen}
                  className={`min-h-10 min-w-10 rounded-lg border px-3 text-sm font-medium ${
                    chosen ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700'
                  } ${size?.availability_status === false ? 'text-gray-400 line-through' : ''}`}
                >
                  {size?.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductOptions;
