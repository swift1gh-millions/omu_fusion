import React, { createContext, useContext, useReducer, useEffect } from "react";
import EnhancedAuthService, {
  AuthUser,
  UserRole,
} from "../utils/enhancedAuthService";
import ErrorService from "../utils/errorService";
import CacheService from "../utils/cacheService";
import {
  CartService,
  CartItem as FirestoreCartItem,
} from "../utils/cartService";
import toast from "react-hot-toast";

// Cart Item interface (compatible with Firestore CartItem)
export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  productId?: string; // For compatibility with Firestore
}

// Helper function to generate consistent IDs from productId
const generateCartItemId = (productId: string, index: number = 0): number => {
  const numericId = parseInt(productId);
  return isNaN(numericId) ? Date.now() + index : numericId;
};

// State interface
interface AppState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  theme: "light" | "dark";
  notifications: Notification[];
  cart: CartItem[];
  isCartOpen: boolean;
  cartItemCount: number;
  cartTotal: number;
}

// Notification interface
interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  timestamp: number;
  read: boolean;
}

// Action types
type AppAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: AuthUser | null }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_THEME"; payload: "light" | "dark" }
  | { type: "ADD_NOTIFICATION"; payload: Notification }
  | { type: "REMOVE_NOTIFICATION"; payload: string }
  | { type: "MARK_NOTIFICATION_READ"; payload: string }
  | { type: "CLEAR_NOTIFICATIONS" }
  | {
      type: "SET_CART";
      payload: { items: CartItem[]; itemCount: number; total: number };
    }
  | {
      type: "ADD_TO_CART";
      payload: Omit<CartItem, "quantity"> & { quantity?: number };
    }
  | { type: "REMOVE_FROM_CART"; payload: { productId: string } }
  | { type: "UPDATE_CART_QUANTITY"; payload: { id: number; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "SET_CART_OPEN"; payload: boolean };

// Initial state
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  theme: "light",
  notifications: [],
  cart: [],
  isCartOpen: false,
  cartItemCount: 0,
  cartTotal: 0,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      };

    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };

    case "SET_THEME":
      return { ...state, theme: action.payload };

    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };

    case "REMOVE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter(
          (n) => n.id !== action.payload
        ),
      };

    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };

    case "CLEAR_NOTIFICATIONS":
      return { ...state, notifications: [] };

    case "SET_CART":
      return {
        ...state,
        cart: action.payload.items,
        cartItemCount: action.payload.itemCount,
        cartTotal: action.payload.total,
      };

    case "ADD_TO_CART": {
      const existingItem = state.cart.find(
        (item) =>
          item.id === action.payload.id &&
          item.size === action.payload.size &&
          item.color === action.payload.color
      );

      let newCart: CartItem[];

      if (existingItem) {
        newCart = state.cart.map((item) =>
          item.id === existingItem.id &&
          item.size === existingItem.size &&
          item.color === existingItem.color
            ? {
                ...item,
                quantity: item.quantity + (action.payload.quantity || 1),
              }
            : item
        );
      } else {
        newCart = [
          ...state.cart,
          { ...action.payload, quantity: action.payload.quantity || 1 },
        ];
      }

      const cartItemCount = newCart.reduce(
        (total, item) => total + item.quantity,
        0
      );
      const cartTotal = newCart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      return {
        ...state,
        cart: newCart,
        cartItemCount,
        cartTotal,
      };
    }

    case "REMOVE_FROM_CART": {
      const newCart = state.cart.filter(
        (item) => item.productId !== action.payload.productId
      );
      const cartItemCount = newCart.reduce(
        (total, item) => total + item.quantity,
        0
      );
      const cartTotal = newCart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      return {
        ...state,
        cart: newCart,
        cartItemCount,
        cartTotal,
      };
    }

    case "UPDATE_CART_QUANTITY": {
      if (action.payload.quantity <= 0) {
        // Find the productId for the given id to remove it
        const itemToRemove = state.cart.find(
          (item) => item.id === action.payload.id
        );
        if (itemToRemove?.productId) {
          return appReducer(state, {
            type: "REMOVE_FROM_CART",
            payload: { productId: itemToRemove.productId },
          });
        }
        return state;
      }

      const newCart = state.cart.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );

      const cartItemCount = newCart.reduce(
        (total, item) => total + item.quantity,
        0
      );
      const cartTotal = newCart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      return {
        ...state,
        cart: newCart,
        cartItemCount,
        cartTotal,
      };
    }

    case "CLEAR_CART":
      return {
        ...state,
        cart: [],
        cartItemCount: 0,
        cartTotal: 0,
      };

    case "TOGGLE_CART":
      return {
        ...state,
        isCartOpen: !state.isCartOpen,
      };

    case "SET_CART_OPEN":
      return {
        ...state,
        isCartOpen: action.payload,
      };

    default:
      return state;
  }
}

// Context interface
interface AppContextType extends AppState {
  // Auth methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;

  // Role checking methods
  isAdmin: () => boolean;
  isModerator: () => boolean;
  hasPermission: (resource: string, action: string) => boolean;

  // Notification methods
  addNotification: (type: Notification["type"], message: string) => void;
  removeNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Theme methods
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;

  // Error handling
  clearError: () => void;

  // Cart methods
  addToCart: (
    item: Omit<CartItem, "quantity"> & { quantity?: number }
  ) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleCart: () => void;
  setCartOpen: (isOpen: boolean) => void;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = EnhancedAuthService.onAuthStateChanged((user) => {
      dispatch({ type: "SET_USER", payload: user });
    });

    // Start cache cleanup
    CacheService.startCleanup();

    return unsubscribe;
  }, []);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      dispatch({ type: "SET_THEME", payload: savedTheme });
    }
  }, []);

  // Load guest cart from localStorage if user is not authenticated
  useEffect(() => {
    if (!state.user?.id && !state.isLoading) {
      const guestCart = localStorage.getItem("guestCart");
      if (guestCart) {
        try {
          const cartItems: CartItem[] = JSON.parse(guestCart);
          const itemCount = cartItems.reduce(
            (total, item) => total + item.quantity,
            0
          );
          const total = cartItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
          );

          dispatch({
            type: "SET_CART",
            payload: { items: cartItems, itemCount, total },
          });
        } catch (error) {
          console.error("Error loading guest cart:", error);
          localStorage.removeItem("guestCart");
        }
      }
    }
  }, [state.user?.id, state.isLoading]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle("dark", state.theme === "dark");
    localStorage.setItem("theme", state.theme);
  }, [state.theme]);

  // Auth methods
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      const user = await EnhancedAuthService.signIn({ email, password });

      addNotification("success", `Welcome back, ${user.firstName}!`);
    } catch (error) {
      const errorMessage = (error as Error).message;
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      addNotification("error", errorMessage);
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const signUp = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<void> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      const user = await EnhancedAuthService.signUp({
        firstName,
        lastName,
        email,
        password,
      });

      addNotification(
        "success",
        `Welcome to OMU Fusion, ${user.firstName}! Please verify your email.`
      );
    } catch (error) {
      const errorMessage = (error as Error).message;
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      addNotification("error", errorMessage);
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await EnhancedAuthService.signOut();
      dispatch({ type: "CLEAR_NOTIFICATIONS" });
      addNotification("info", "You have been logged out successfully.");
    } catch (error) {
      const errorMessage = (error as Error).message;
      ErrorService.logError(error as Error, { action: "Logout" }, "medium");
      addNotification("error", errorMessage);
      throw error;
    }
  };

  // Role checking methods
  const isAdmin = (): boolean => {
    return state.user ? EnhancedAuthService.isAdmin(state.user) : false;
  };

  const isModerator = (): boolean => {
    return state.user ? EnhancedAuthService.isModerator(state.user) : false;
  };

  const hasPermission = (resource: string, action: string): boolean => {
    return state.user
      ? EnhancedAuthService.hasPermission(state.user, resource, action)
      : false;
  };

  // Notification methods
  const addNotification = (
    type: Notification["type"],
    message: string
  ): void => {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: Date.now(),
      read: false,
    };

    dispatch({ type: "ADD_NOTIFICATION", payload: notification });

    // Auto-remove success and info notifications after 5 seconds
    if (type === "success" || type === "info") {
      setTimeout(() => {
        dispatch({ type: "REMOVE_NOTIFICATION", payload: notification.id });
      }, 5000);
    }
  };

  const removeNotification = (id: string): void => {
    dispatch({ type: "REMOVE_NOTIFICATION", payload: id });
  };

  const markNotificationRead = (id: string): void => {
    dispatch({ type: "MARK_NOTIFICATION_READ", payload: id });
  };

  const clearNotifications = (): void => {
    dispatch({ type: "CLEAR_NOTIFICATIONS" });
  };

  // Theme methods
  const toggleTheme = (): void => {
    dispatch({
      type: "SET_THEME",
      payload: state.theme === "light" ? "dark" : "light",
    });
  };

  const setTheme = (theme: "light" | "dark"): void => {
    dispatch({ type: "SET_THEME", payload: theme });
  };

  // Error handling
  const clearError = (): void => {
    dispatch({ type: "SET_ERROR", payload: null });
  };

  // Load user cart when user changes
  useEffect(() => {
    const loadUserCart = async () => {
      if (state.user?.id) {
        try {
          const userCart = await CartService.getUserCart(state.user.id);
          if (userCart) {
            // Convert Firestore cart items to local cart items
            const cartItems: CartItem[] = userCart.items.map((item, index) => ({
              id: generateCartItemId(item.productId, index),
              name: item.productName,
              price: item.price,
              image: item.productImage,
              quantity: item.quantity,
              productId: item.productId,
            }));

            const itemCount = cartItems.reduce(
              (total, item) => total + item.quantity,
              0
            );
            const total = cartItems.reduce(
              (total, item) => total + item.price * item.quantity,
              0
            );

            dispatch({
              type: "SET_CART",
              payload: { items: cartItems, itemCount, total },
            });
          } else {
            // No cart exists, start with empty cart
            dispatch({
              type: "SET_CART",
              payload: { items: [], itemCount: 0, total: 0 },
            });
          }
        } catch (error) {
          console.error("Error loading user cart:", error);
          addNotification("error", "Failed to load your cart");
        }
      } else {
        // User not logged in, clear cart
        dispatch({
          type: "SET_CART",
          payload: { items: [], itemCount: 0, total: 0 },
        });
      }
    };

    loadUserCart();
  }, [state.user?.id]);

  // Cart methods
  const addToCart = async (
    item: Omit<CartItem, "quantity"> & { quantity?: number }
  ): Promise<void> => {
    const cartItem: CartItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.quantity || 1,
      size: item.size,
      color: item.color,
      productId: item.productId || item.id.toString(),
    };

    if (state.user?.id) {
      // Authenticated user - use database
      try {
        const firestoreCartItem = {
          productId: cartItem.productId || cartItem.id.toString(),
          productName: cartItem.name,
          productImage: cartItem.image,
          price: cartItem.price,
          quantity: cartItem.quantity,
        };

        await CartService.addToCart(state.user.id, firestoreCartItem);

        // Reload cart from database
        const userCart = await CartService.getUserCart(state.user.id);
        if (userCart) {
          const cartItems: CartItem[] = userCart.items.map((dbItem, index) => ({
            id: generateCartItemId(dbItem.productId, index),
            name: dbItem.productName,
            price: dbItem.price,
            image: dbItem.productImage,
            quantity: dbItem.quantity,
            productId: dbItem.productId,
          }));

          const itemCount = cartItems.reduce(
            (total, item) => total + item.quantity,
            0
          );
          const total = cartItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
          );

          dispatch({
            type: "SET_CART",
            payload: { items: cartItems, itemCount, total },
          });
        }

        addNotification("success", `${item.name} added to cart!`);
      } catch (error) {
        console.error("Error adding to cart:", error);
        addNotification("error", "Failed to add item to cart");
      }
    } else {
      // Guest user - use localStorage
      try {
        const existingItem = state.cart.find(
          (existing) =>
            existing.id === cartItem.id &&
            existing.size === cartItem.size &&
            existing.color === cartItem.color
        );

        let newCart: CartItem[];
        if (existingItem) {
          newCart = state.cart.map((existing) =>
            existing.id === cartItem.id &&
            existing.size === cartItem.size &&
            existing.color === cartItem.color
              ? { ...existing, quantity: existing.quantity + cartItem.quantity }
              : existing
          );
        } else {
          newCart = [...state.cart, cartItem];
        }

        // Save to localStorage for guests
        localStorage.setItem("guestCart", JSON.stringify(newCart));

        const itemCount = newCart.reduce(
          (total, item) => total + item.quantity,
          0
        );
        const total = newCart.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );

        dispatch({
          type: "SET_CART",
          payload: { items: newCart, itemCount, total },
        });

        addNotification("success", `${item.name} added to cart!`);
      } catch (error) {
        console.error("Error adding to guest cart:", error);
        addNotification("error", "Failed to add item to cart");
      }
    }
  };

  const removeFromCart = async (productId: string): Promise<void> => {
    if (!state.user?.id) {
      addNotification("error", "Please sign in to manage your cart");
      return;
    }

    try {
      await CartService.removeFromCart(state.user.id, productId);

      // Reload cart from database
      const userCart = await CartService.getUserCart(state.user.id);
      if (userCart) {
        const cartItems: CartItem[] = userCart.items.map((item, index) => ({
          id: generateCartItemId(item.productId, index),
          name: item.productName,
          price: item.price,
          image: item.productImage,
          quantity: item.quantity,
          productId: item.productId,
        }));

        const itemCount = cartItems.reduce(
          (total, item) => total + item.quantity,
          0
        );
        const total = cartItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );

        dispatch({
          type: "SET_CART",
          payload: { items: cartItems, itemCount, total },
        });
      }

      addNotification("success", "Item removed from cart");
    } catch (error) {
      console.error("Error removing from cart:", error);
      addNotification("error", "Failed to remove item from cart");
    }
  };

  const updateQuantity = async (
    id: number,
    quantity: number
  ): Promise<void> => {
    if (!state.user?.id) {
      addNotification("error", "Please sign in to manage your cart");
      return;
    }

    try {
      await CartService.updateQuantity(state.user.id, id.toString(), quantity);

      // Reload cart from database
      const userCart = await CartService.getUserCart(state.user.id);
      if (userCart) {
        const cartItems: CartItem[] = userCart.items.map((item, index) => ({
          id: generateCartItemId(item.productId, index),
          name: item.productName,
          price: item.price,
          image: item.productImage,
          quantity: item.quantity,
          productId: item.productId,
        }));

        const itemCount = cartItems.reduce(
          (total, item) => total + item.quantity,
          0
        );
        const total = cartItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );

        dispatch({
          type: "SET_CART",
          payload: { items: cartItems, itemCount, total },
        });
      }
    } catch (error) {
      console.error("Error updating cart quantity:", error);
      addNotification("error", "Failed to update item quantity");
    }
  };

  const clearCart = async (): Promise<void> => {
    if (!state.user?.id) {
      addNotification("error", "Please sign in to manage your cart");
      return;
    }

    try {
      await CartService.clearCart(state.user.id);
      dispatch({
        type: "SET_CART",
        payload: { items: [], itemCount: 0, total: 0 },
      });
      addNotification("success", "Cart cleared");
    } catch (error) {
      console.error("Error clearing cart:", error);
      addNotification("error", "Failed to clear cart");
    }
  };

  const toggleCart = (): void => {
    dispatch({ type: "TOGGLE_CART" });
  };

  const setCartOpen = (isOpen: boolean): void => {
    dispatch({ type: "SET_CART_OPEN", payload: isOpen });
  };

  const contextValue: AppContextType = {
    ...state,
    signIn,
    signUp,
    logout,
    isAdmin,
    isModerator,
    hasPermission,
    addNotification,
    removeNotification,
    markNotificationRead,
    clearNotifications,
    toggleTheme,
    setTheme,
    clearError,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    setCartOpen,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAuth = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AppProvider");
  }
  return context;
};

// Export useApp as alias for backward compatibility
export const useApp = useAuth;

// Export useCart hook for cart functionality
export const useCart = () => {
  const context = useAuth();
  return {
    cart: context.cart,
    cartItemCount: context.cartItemCount,
    cartTotal: context.cartTotal,
    isCartOpen: context.isCartOpen,
    addToCart: context.addToCart,
    removeFromCart: context.removeFromCart,
    updateQuantity: context.updateQuantity,
    clearCart: context.clearCart,
    toggleCart: context.toggleCart,
    setCartOpen: context.setCartOpen,
  };
};

// Export for backward compatibility
export { AppContext };
export default AppProvider;
