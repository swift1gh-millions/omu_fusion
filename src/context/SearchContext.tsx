import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

// Product interface (should match the one in ShopPage)
export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isNew?: boolean;
  isOnSale?: boolean;
  rating: number;
  reviews: number;
  description?: string;
  tags?: string[];
}

// Search context interface
interface SearchContextType {
  isSearchOpen: boolean;
  searchTerm: string;
  searchResults: Product[];
  isSearching: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  setSearchTerm: (term: string) => void;
  performSearch: (term: string, products?: Product[]) => void;
  clearSearch: () => void;
  searchAndNavigate: (term: string) => void;
}

// Sample products data (this would normally come from an API or global state)
const sampleProducts: Product[] = [
  {
    id: 1,
    name: "Premium Cotton T-Shirt",
    price: 49.99,
    originalPrice: 69.99,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
    category: "Apparel",
    isOnSale: true,
    rating: 4.8,
    reviews: 124,
    description: "Comfortable premium cotton t-shirt with modern fit",
    tags: ["cotton", "casual", "comfortable", "premium"],
  },
  {
    id: 2,
    name: "Minimalist Watch",
    price: 299.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    category: "Accessories",
    isNew: true,
    rating: 4.9,
    reviews: 89,
    description: "Elegant minimalist watch with premium leather strap",
    tags: ["watch", "minimalist", "elegant", "leather"],
  },
  {
    id: 3,
    name: "Wireless Headphones",
    price: 199.99,
    originalPrice: 249.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    category: "Electronics",
    isOnSale: true,
    rating: 4.7,
    reviews: 203,
    description: "High-quality wireless headphones with noise cancellation",
    tags: ["wireless", "audio", "noise-cancellation", "headphones"],
  },
  {
    id: 4,
    name: "Leather Handbag",
    price: 159.99,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
    category: "Accessories",
    rating: 4.6,
    reviews: 156,
    description: "Stylish leather handbag perfect for everyday use",
    tags: ["leather", "handbag", "stylish", "everyday"],
  },
  {
    id: 5,
    name: "Smart Fitness Tracker",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400",
    category: "Electronics",
    isNew: true,
    rating: 4.5,
    reviews: 89,
    description: "Advanced fitness tracker with heart rate monitoring",
    tags: ["fitness", "tracker", "smart", "health"],
  },
  {
    id: 6,
    name: "Casual Sneakers",
    price: 89.99,
    originalPrice: 119.99,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400",
    category: "Footwear",
    isOnSale: true,
    rating: 4.4,
    reviews: 267,
    description: "Comfortable casual sneakers for everyday wear",
    tags: ["sneakers", "casual", "comfortable", "shoes"],
  },
];

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const openSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearchTerm("");
    setSearchResults([]);
  }, []);

  const performSearch = useCallback(
    (term: string, products: Product[] = sampleProducts) => {
      if (!term.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      // Simulate API delay
      setTimeout(() => {
        const filtered = products.filter((product) => {
          const searchTermLower = term.toLowerCase();
          return (
            product.name.toLowerCase().includes(searchTermLower) ||
            product.category.toLowerCase().includes(searchTermLower) ||
            product.description?.toLowerCase().includes(searchTermLower) ||
            product.tags?.some((tag) =>
              tag.toLowerCase().includes(searchTermLower)
            )
          );
        });

        // Sort by relevance (exact matches first, then partial matches)
        const sorted = filtered.sort((a, b) => {
          const termLower = term.toLowerCase();
          const aNameMatch = a.name.toLowerCase().includes(termLower);
          const bNameMatch = b.name.toLowerCase().includes(termLower);

          if (aNameMatch && !bNameMatch) return -1;
          if (!aNameMatch && bNameMatch) return 1;

          // If both match in name, prioritize exact matches
          const aExactMatch = a.name.toLowerCase() === termLower;
          const bExactMatch = b.name.toLowerCase() === termLower;

          if (aExactMatch && !bExactMatch) return -1;
          if (!aExactMatch && bExactMatch) return 1;

          return 0;
        });

        setSearchResults(sorted.slice(0, 8)); // Limit to 8 results
        setIsSearching(false);
      }, 300);
    },
    []
  );

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setSearchResults([]);
    setIsSearching(false);
  }, []);

  const searchAndNavigate = useCallback(
    (term: string) => {
      if (term.trim()) {
        closeSearch();
        navigate(`/shop?search=${encodeURIComponent(term)}`);
      }
    },
    [navigate, closeSearch]
  );

  const handleSetSearchTerm = useCallback(
    (term: string) => {
      setSearchTerm(term);
      performSearch(term);
    },
    [performSearch]
  );

  const value: SearchContextType = {
    isSearchOpen,
    searchTerm,
    searchResults,
    isSearching,
    openSearch,
    closeSearch,
    setSearchTerm: handleSetSearchTerm,
    performSearch,
    clearSearch,
    searchAndNavigate,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};
