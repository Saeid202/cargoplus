"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateProduct } from "@/app/actions/seller";
import type { SellerProduct } from "@/app/actions/seller";
import type { Category } from "@/types/database";
import { Loader2, Upload, X } from "lucide-react";

interface EditProductFormProps {
  product: SellerProduct;
  categories: Category[];
}

export function EditProductForm({ product, categories }: EditProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    product.product_images[0]?.url || null
  );
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);

  // Initialize specs from product
  useEffect(() => {
    const specObj = product.specifications as Record<string, string>;
    if (specObj && Object.keys(specObj).length > 0) {
      setSpecs(Object.entries(specObj).map(([key, value]) => ({ key, value })));
    }
  }, [product.specifications]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSpec = () => {
    setSpecs([...specs, { key: "", value: "" }]);
  };

  const removeSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const updateSpec = (index: number, field: "key" | "value", value: string) => {
    const updated = [...specs];
    updated[index][field] = value;
    setSpecs(updated);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    // Add specifications as JSON
    const specObj: Record<string, string> = {};
    specs.forEach(({ key, value }) => {
      if (key && value) {
        specObj[key] = value;
      }
    });
    formData.set("specifications", JSON.stringify(specObj));

    const result = await updateProduct(product.id, formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/seller/products");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Product Image */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Product Image</label>
        <div className="border-2 border-dashed rounded-lg p-4">
          {imagePreview ? (
            <div className="relative w-32 h-32 mx-auto">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  const input = document.getElementById("image") as HTMLInputElement;
                  if (input) input.value = "";
                }}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center py-8 cursor-pointer">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Click to upload image</span>
              <span className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</span>
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Product Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1.5">
          Product Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={product.name}
          className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1.5">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          required
          defaultValue={product.description || ""}
          className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      {/* Category and Price Row */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium mb-1.5">
            Category *
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={product.category_id}
            className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium mb-1.5">
            Price (CAD) *
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={product.price}
            className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Compare at Price and Stock Row */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="compareAtPrice" className="block text-sm font-medium mb-1.5">
            Compare at Price (CAD)
          </label>
          <input
            id="compareAtPrice"
            name="compareAtPrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product.compare_at_price || ""}
            className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-muted-foreground mt-1">Original price for showing discount</p>
        </div>

        <div>
          <label htmlFor="stockQuantity" className="block text-sm font-medium mb-1.5">
            Stock Quantity *
          </label>
          <input
            id="stockQuantity"
            name="stockQuantity"
            type="number"
            min="0"
            required
            defaultValue={product.stock_quantity}
            className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Specifications */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">Specifications</label>
          <button
            type="button"
            onClick={addSpec}
            className="text-sm text-primary hover:underline"
          >
            + Add Specification
          </button>
        </div>
        
        {specs.length > 0 && (
          <div className="space-y-2 mb-2">
            {specs.map((spec, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Key (e.g., Weight)"
                  value={spec.key}
                  onChange={(e) => updateSpec(index, "key", e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                <input
                  type="text"
                  placeholder="Value (e.g., 30kg)"
                  value={spec.value}
                  onChange={(e) => updateSpec(index, "value", e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeSpec(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Add product specifications like dimensions, weight, material, etc.
        </p>
      </div>

      {/* Status Display */}
      <div className="p-3 bg-muted rounded-lg">
        <p className="text-sm">
          <span className="font-medium">Status:</span>{" "}
          <span
            className={`font-medium ${
              product.status === "active"
                ? "text-green-600"
                : product.status === "pending"
                ? "text-yellow-600"
                : product.status === "rejected"
                ? "text-red-600"
                : ""
            }`}
          >
            {product.status}
          </span>
        </p>
        {product.status === "pending" && (
          <p className="text-xs text-muted-foreground mt-1">
            This product is awaiting admin approval.
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border rounded-lg font-medium hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
