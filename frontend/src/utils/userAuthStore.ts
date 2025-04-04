import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import brain from '../brain';
import { toast } from 'sonner';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: number;
  // Add specific roles for future admin/staff identification
  role?: 'admin' | 'customer' | 'supplier';
  status?: 'active' | 'inactive' | 'suspended';
  savedAddresses?: ShippingAddress[];
  company?: string; // For suppliers
  description?: string; // For suppliers
  phone?: string; // For suppliers
}

export interface ShippingAddress {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

interface UserAuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Auth actions
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (user: User | {email: string, password: string}) => Promise<void>;
  signOut: () => void;
  
  // Auth state
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // User data management
  saveAddress: (address: Omit<ShippingAddress, 'id'>) => void;
  updateAddress: (address: ShippingAddress) => void;
  deleteAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;
  updateUserProfile: (updatedUser: Partial<User>) => void;
}

// Mock users database - in a real app this would be in Firebase
// Initialize from localStorage or empty array if not found
let mockUsers: User[] = JSON.parse(localStorage.getItem('ahaduMarketUsers') || '[]');

// Add admin user if not present
const adminEmail = "yohannisaweke29@gmail.com";
if (!mockUsers.some(user => user.email === adminEmail)) {
  const adminUser = {
    id: "admin-user",
    name: "Admin User",
    email: adminEmail,
    password: "admin123", // This will be hashed when migrated to backend
    createdAt: Date.now()
  };
  mockUsers.push(adminUser);
  
  // Try to register admin with backend (fire and forget)
  setTimeout(() => {
    try {
      brain.register_user({
        email: adminEmail,
        password: "2321271630@wW",
        name: "Admin User"
      }).catch(err => console.log('Admin user may already exist in backend'));
    } catch (error) {
      console.error('Failed to register admin user with backend');
    }
  }, 1000);
}

// Function to save users to localStorage
const saveUsersToStorage = () => {
  localStorage.setItem('ahaduMarketUsers', JSON.stringify(mockUsers));
};

// Initial save to ensure admin is persisted
saveUsersToStorage();

export const useUserAuth = create<UserAuthState>(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      signUp: async (email, password, name) => {
        set({ isLoading: true, error: null });
        
        try {
          // Try to register with the backend API first
          try {
            const response = await brain.register_user({
              email,
              password,
              name
            });
            
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.detail || `Registration failed: ${response.statusText}`);
            }
            
            const userData = await response.json();
            
            // Convert API response to User object
            const newUser: User = {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              createdAt: Date.now(),
              role: userData.role || 'customer',
              status: userData.status || 'active',
            };
            
            set({ 
              currentUser: newUser,
              isAuthenticated: true, 
              isLoading: false 
            });
            
            return;
          } catch (apiError) {
            console.error('API registration failed, falling back to local storage:', apiError);
            // Continue with local storage fallback
          }
          
          // Fallback to localStorage if API fails
          // Get latest users from localStorage first
          const storedUsers = JSON.parse(localStorage.getItem('ahaduMarketUsers') || '[]');
          mockUsers = storedUsers.length > mockUsers.length ? storedUsers : mockUsers;
          
          // Check if user exists
          const userExists = mockUsers.some(user => user.email === email);
          
          if (userExists) {
            throw new Error('User with this email already exists');
          }
          
          // Create new user locally
          const newUser: User = {
            id: Math.random().toString(36).substring(2, 15),
            email,
            name,
            createdAt: Date.now(),
          };
          
          // Save to mock database
          mockUsers.push(newUser);
          
          // Save to localStorage
          saveUsersToStorage();
          
          // Try to migrate users to backend (fire and forget)
          try {
            brain.migrate_local_users(mockUsers);
          } catch (migrateError) {
            console.error('Failed to migrate users to backend:', migrateError);
          }
          
          // Save to local state
          set({ 
            currentUser: newUser,
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An unknown error occurred', 
            isLoading: false 
          });
        }
      },
      
      signIn: async (userOrCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          if ('id' in userOrCredentials) {
            // Direct user object provided (for admin login)
            set({ 
              currentUser: userOrCredentials as User,
              isAuthenticated: true, 
              isLoading: false 
            });
          } else {
            // Email and password provided
            const { email, password } = userOrCredentials;
            
            // Try backend login first
            try {
              const response = await brain.login_user({
                email,
                password
              });
              
              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Login failed: ${response.statusText}`);
              }
              
              const data = await response.json();
              
              // Convert API response to User object
              const user: User = {
                id: data.user.id,
                email: data.user.email,
                name: data.user.name,
                createdAt: Date.now(),
                role: data.user.role || 'customer',
                status: data.user.status || 'active',
                company: data.user.company,
                description: data.user.description,
                phone: data.user.phone
              };
              
              // Login successful with API
              set({ 
                currentUser: user,
                isAuthenticated: true, 
                isLoading: false 
              });
              
              return;
            } catch (apiError) {
              console.error('API login failed, falling back to local storage:', apiError);
              // Continue with local storage fallback
            }
            
            // Try to get latest users from localStorage
            const storedUsers = JSON.parse(localStorage.getItem('ahaduMarketUsers') || '[]');
            mockUsers = storedUsers.length > mockUsers.length ? storedUsers : mockUsers;
            
            // Find user by email
            const user = mockUsers.find(user => user.email === email);
            
            if (!user) {
              throw new Error('This email is not registered. Please sign up first.');
            }
            
            // In a real app, we'd validate the password here
            // For now, we're assuming it's correct since we don't store actual passwords
            
            // Login successful with localStorage
            set({ 
              currentUser: user,
              isAuthenticated: true, 
              isLoading: false 
            });
            
            // Try to migrate users to backend (fire and forget)
            try {
              brain.migrate_local_users(mockUsers);
            } catch (migrateError) {
              console.error('Failed to migrate users to backend:', migrateError);
            }
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An unknown error occurred', 
            isLoading: false 
          });
        }
      },
      
      signOut: () => {
        set({ 
          currentUser: null,
          isAuthenticated: false 
        });
      },
      
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      
      // User data management methods
      saveAddress: (addressData) => {
        set((state) => {
          if (!state.currentUser) return state;
          
          const newAddress = {
            ...addressData,
            id: 'addr_' + Date.now(),
            isDefault: !state.currentUser.savedAddresses || state.currentUser.savedAddresses.length === 0
          };
          
          const savedAddresses = state.currentUser.savedAddresses || [];
          
          // If this is set as default, remove default flag from other addresses
          const updatedAddresses = newAddress.isDefault 
            ? savedAddresses.map(addr => ({ ...addr, isDefault: false }))
            : [...savedAddresses];
          
          const updatedUser = {
            ...state.currentUser,
            savedAddresses: [...updatedAddresses, newAddress]
          };
          
          // Update the user in the mock database
          const userIndex = mockUsers.findIndex(user => user.id === state.currentUser!.id);
          if (userIndex !== -1) {
            mockUsers[userIndex] = updatedUser;
            saveUsersToStorage();
          }
          
          return { currentUser: updatedUser };
        });
      },
      
      updateAddress: (updatedAddress) => {
        set((state) => {
          if (!state.currentUser || !state.currentUser.savedAddresses) return state;
          
          const updatedAddresses = state.currentUser.savedAddresses.map(addr =>
            addr.id === updatedAddress.id ? updatedAddress : addr
          );
          
          const updatedUser = {
            ...state.currentUser,
            savedAddresses: updatedAddresses
          };
          
          // Update the user in the mock database
          const userIndex = mockUsers.findIndex(user => user.id === state.currentUser!.id);
          if (userIndex !== -1) {
            mockUsers[userIndex] = updatedUser;
            saveUsersToStorage();
          }
          
          return { currentUser: updatedUser };
        });
      },
      
      deleteAddress: (addressId) => {
        set((state) => {
          if (!state.currentUser || !state.currentUser.savedAddresses) return state;
          
          const filteredAddresses = state.currentUser.savedAddresses.filter(addr => addr.id !== addressId);
          
          const updatedUser = {
            ...state.currentUser,
            savedAddresses: filteredAddresses
          };
          
          // Update the user in the mock database
          const userIndex = mockUsers.findIndex(user => user.id === state.currentUser!.id);
          if (userIndex !== -1) {
            mockUsers[userIndex] = updatedUser;
            saveUsersToStorage();
          }
          
          return { currentUser: updatedUser };
        });
      },
      
      setDefaultAddress: (addressId) => {
        set((state) => {
          if (!state.currentUser || !state.currentUser.savedAddresses) return state;
          
          const updatedAddresses = state.currentUser.savedAddresses.map(addr => ({
            ...addr,
            isDefault: addr.id === addressId
          }));
          
          const updatedUser = {
            ...state.currentUser,
            savedAddresses: updatedAddresses
          };
          
          // Update the user in the mock database
          const userIndex = mockUsers.findIndex(user => user.id === state.currentUser!.id);
          if (userIndex !== -1) {
            mockUsers[userIndex] = updatedUser;
            saveUsersToStorage();
          }
          
          return { currentUser: updatedUser };
        });
      },
      
      updateUserProfile: (updatedUserData) => {
        set((state) => {
          if (!state.currentUser) return state;
          
          const updatedUser = {
            ...state.currentUser,
            ...updatedUserData
          };
          
          // Update the user in the mock database
          const userIndex = mockUsers.findIndex(user => user.id === state.currentUser!.id);
          if (userIndex !== -1) {
            mockUsers[userIndex] = updatedUser;
            saveUsersToStorage();
          }
          
          console.log('User profile updated successfully', updatedUserData);
          toast.success('Profile updated successfully');
          return { currentUser: updatedUser };
        });
      }
    }),
    {
      name: 'ahadu-user-auth',
    }
  )
);