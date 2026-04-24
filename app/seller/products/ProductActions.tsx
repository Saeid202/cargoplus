"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteProduct } from "@/app/actions/seller";
import { Eye, FileDown, Pencil, Trash2, Loader2 } from "lucide-react";

interface ProductActionsProps {
  productId: string;
  productName: string;
  productSlug: string;
}

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";

export function ProductActions({ productId, productName, productSlug }: ProductActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      // Auto-reset after 3s if not confirmed
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setDeleting(true);
    const result = await deleteProduct(productId);
    if (result.error) {
      alert(result.error);
      setDeleting(false);
      setConfirmDelete(false);
      return;
    }
    router.refresh();
  };

  const handleDownloadPdf = () => {
    // Opens the public product page in a print-ready new tab
    window.open(`/products/${productSlug}?print=1`, "_blank");
  };

  return (
    <div className="flex items-center justify-end gap-1">
      {/* View listing */}
      <Link
        href={`/products/${productSlug}`}
        target="_blank"
        title="View listing"
        className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[#EDE9F6]"
        style={{ color: PURPLE }}
      >
        <Eye className="h-4 w-4" />
      </Link>

      {/* Download PDF */}
      <button
        type="button"
        title="Download PDF"
        onClick={handleDownloadPdf}
        className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[#EDE9F6]"
        style={{ color: PURPLE }}
      >
        <FileDown className="h-4 w-4" />
      </button>

      {/* Edit */}
      <Link
        href={`/seller/products/${productId}/edit`}
        title="Edit product"
        className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[#EDE9F6]"
        style={{ color: PURPLE }}
      >
        <Pencil className="h-4 w-4" />
      </Link>

      {/* Delete — first click shows red confirm state, second click deletes */}
      <button
        type="button"
        title={confirmDelete ? "Click again to confirm delete" : "Delete product"}
        onClick={handleDelete}
        disabled={deleting}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
          confirmDelete ? "bg-red-100 scale-110" : "hover:bg-red-50"
        }`}
        style={{ color: confirmDelete ? "#dc2626" : "#ef4444" }}
      >
        {deleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
