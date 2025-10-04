import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import {
  AuthService,
  AuthUser,
  SignUpData,
  SignInData,
} from "../utils/authService";

// Types
export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  digitalAddress?: string;
  apartment?: string;
  country?: string;
  createdAt?: string;
  emailVerified?: boolean;
  isAdmin?: boolean;
}

export interface AppState {
  cart: CartItem[];
  user: User | null;
  isAuthenticated: boolean;
  isCartOpen: boolean;
  cartItemCount: number;
  cartTotal: number;
}

// Action types
export type AppAction =
  | {
      type: "ADD_TO_CART";
      payload: Omit<CartItem, "quantity"> & { quantity?: number };
    }
  | { type: "REMOVE_FROM_CART"; payload: { id: number } }
  | { type: "UPDATE_CART_QUANTITY"; payload: { id: number; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "SET_CART_OPEN"; payload: boolean }
  | { type: "LOGIN"; payload: User }
  | { type: "LOGOUT" }
  | { type: "UPDATE_USER"; payload: Partial<User> };

// Initial state with localStorage check but no user persistence
const getInitialState = (): AppState => {
  try {
    const savedState = localStorage.getItem("omu_app_state");
    if (savedState) {
      const parsed = JSON.parse(savedState);
      return {
        cart: parsed.cart || [],
        user: null, // Don't persist user - will be set by Firebase Auth
        isAuthenticated: false, // Will be set by Firebase Auth
        isCartOpen: false, // Always start with cart closed
        cartItemCount: parsed.cartItemCount || 0,
        cartTotal: parsed.cartTotal || 0,
      };
    }
  } catch (error) {
    console.error("Error loading saved state:", error);
  }

  return {
    cart: [],
    user: null,
    isAuthenticated: false,
    isCartOpen: false,
    cartItemCount: 0,
    cartTotal: 0,
  };
};

const initialState: AppState = getInitialState();

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
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
        (item) => item.id !== action.payload.id
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
        return appReducer(state, {
          type: "REMOVE_FROM_CART",
          payload: { id: action.payload.id },
        });
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

    case "LOGIN":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };

    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        cart: [], // Clear cart on logout
        cartItemCount: 0,
        cartTotal: 0,
        isCartOpen: false,
      };

    case "UPDATE_USER":
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };

    default:
      return state;
  }
};

// Context
const AppContext = createContext<
  | {
      state: AppState;
      dispatch: React.Dispatch<AppAction>;
    }
  | undefined
>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Set up Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((user) => {
      if (user) {
        dispatch({ type: "LOGIN", payload: user });
      } else {
        dispatch({ type: "LOGOUT" });
      }
    });

    return () => unsubscribe();
  }, []);

  // Persist cart state to localStorage (not user state)
  useEffect(() => {
    try {
      const stateToSave = {
        cart: state.cart,
        cartItemCount: state.cartItemCount,
        cartTotal: state.cartTotal,
      };
      localStorage.setItem("omu_app_state", JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Error saving state:", error);
    }
  }, [state.cart, state.cartItemCount, state.cartTotal]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

// Convenience hooks
export const useCart = () => {
  const { state, dispatch } = useApp();

  const addToCart = (
    item: Omit<CartItem, "quantity"> & { quantity?: number }
  ) => {
    dispatch({ type: "ADD_TO_CART", payload: item });
  };

  const removeFromCart = (id: number) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: { id } });
  };

  const updateQuantity = (id: number, quantity: number) => {
    dispatch({ type: "UPDATE_CART_QUANTITY", payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const toggleCart = () => {
    dispatch({ type: "TOGGLE_CART" });
  };

  const setCartOpen = (isOpen: boolean) => {
    dispatch({ type: "SET_CART_OPEN", payload: isOpen });
  };

  return {
    cart: state.cart,
    cartItemCount: state.cartItemCount,
    cartTotal: state.cartTotal,
    isCartOpen: state.isCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    setCartOpen,
  };
};

export const useAuth = () => {
  const { state, dispatch } = useApp();

  const login = (user: User) => {
    const userWithTimestamp = {
      ...user,
      createdAt: user.createdAt || new Date().toISOString(),
    };
    dispatch({ type: "LOGIN", payload: userWithTimestamp });
  };

  const logout = async () => {
    try {
      await AuthService.signOut();
      // Firebase auth state listener will handle dispatch
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (state.user) {
      try {
        await AuthService.updateUserProfile(state.user.id, updates);
        dispatch({ type: "UPDATE_USER", payload: updates });
      } catch (error) {
        console.error("Update user error:", error);
        throw error;
      }
    }
  };

  const register = async (userData: SignUpData) => {
    try {
      const user = await AuthService.signUp(userData);
      // Firebase auth state listener will handle login dispatch
      return user;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const signIn = async (credentials: SignInData) => {
    try {
      const user = await AuthService.signIn(credentials);
      // Firebase auth state listener will handle login dispatch
      return user;
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await AuthService.resetPassword(email);
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    }
  };

  const isAdmin = () => {
    return (
      state.user?.isAdmin === true ||
      state.user?.email === "admin@omufusion.com"
    );
  };

  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    login,
    logout,
    updateUser,
    register,
    signIn,
    resetPassword,
    isAdmin,
  };
};
