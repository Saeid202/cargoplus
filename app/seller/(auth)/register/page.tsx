import { Metadata } from "next";
import Link from "next/link";
import { SellerRegisterForm } from "./SellerRegisterForm";

export const metadata: Metadata = {
  title: "Become a Seller",
  description: "Register as a seller on CargoPlus and start selling construction materials and robots to Canadian customers.",
};

export default function SellerRegisterPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Become a Seller</h1>
          <p className="text-muted-foreground">
            Join CargoPlus and reach Canadian customers
          </p>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <SellerRegisterForm />

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have a seller account?{" "}
            <Link href="/seller/login" className="text-primary hover:underline">
              Sign in here
            </Link>
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">What happens next?</h3>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Submit your application with business details</li>
            <li>Our team reviews your application (1-2 business days)</li>
            <li>Once approved, you can start listing products</li>
            <li>Products are reviewed before going live</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
