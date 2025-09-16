import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Header() {
  return (
    <header className="w-full border-b border-[#37322f]/6 bg-[#f7f5f3]" role="banner">
      <div className="max-w-[1060px] mx-auto px-4">
        <nav className="flex items-center justify-between py-4" role="navigation" aria-label="Main navigation">
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="text-[#37322f] font-semibold text-lg hover:text-[#37322f]/80 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#37322f] focus:ring-offset-2 rounded-sm"
              aria-label="Brillance - Go to homepage"
            >
              Brillance
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/products"
                className="text-[#37322f] hover:text-[#37322f]/80 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#37322f] focus:ring-offset-2 rounded-sm px-2 py-1"
              >
                Products
              </Link>
              <Link
                href="/pricing"
                className="text-[#37322f] hover:text-[#37322f]/80 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#37322f] focus:ring-offset-2 rounded-sm px-2 py-1"
              >
                Pricing
              </Link>
              <Link
                href="/docs"
                className="text-[#37322f] hover:text-[#37322f]/80 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#37322f] focus:ring-offset-2 rounded-sm px-2 py-1"
              >
                Docs
              </Link>
            </div>
          </div>
          <Link href="/login">
            <Button
              variant="ghost"
              className="text-[#37322f] hover:bg-[#37322f]/5 transition-all duration-200 focus:ring-2 focus:ring-[#37322f] focus:ring-offset-2"
              aria-label="Log in to your account"
            >
              Log in
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
