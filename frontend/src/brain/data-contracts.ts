/** AddressCreate */
export interface AddressCreate {
  /** Fullname */
  fullName: string;
  /** Address */
  address: string;
  /** City */
  city: string;
  /** State */
  state: string;
  /** Zipcode */
  zipCode: string;
  /** Country */
  country: string;
  /** Phone */
  phone: string;
  /**
   * Isdefault
   * @default false
   */
  isDefault?: boolean;
}

/** AddressResponse */
export interface AddressResponse {
  /** Id */
  id: string;
  /** Userid */
  userId: string;
  /** Fullname */
  fullName: string;
  /** Address */
  address: string;
  /** City */
  city: string;
  /** State */
  state: string;
  /** Zipcode */
  zipCode: string;
  /** Country */
  country: string;
  /** Phone */
  phone: string;
  /** Isdefault */
  isDefault: boolean;
  /** Createdat */
  createdAt: string;
}

/** AddressesResponse */
export interface AddressesResponse {
  /** Addresses */
  addresses: AddressResponse[];
}

/** CategoryResponse */
export interface CategoryResponse {
  /** Categories */
  categories: string[];
}

/** CreateOrderRequest */
export interface CreateOrderRequest {
  /** Items */
  items: OrderItemInput[];
  /** Totalamount */
  totalAmount: number;
  shippingInfo: ShippingInfo;
  /** Paymentmethod */
  paymentMethod: string;
  /** Paymentproof */
  paymentProof?: string | null;
  /** Userid */
  userId?: string | null;
}

/** CreateOrderResponse */
export interface CreateOrderResponse {
  order: AppApisOrdersOrder;
  /**
   * Message
   * @default "Order created successfully"
   */
  message?: string;
}

/** CustomerNotification */
export interface CustomerNotification {
  /** Email */
  email: string;
  /** Subject */
  subject: string;
  /** Message */
  message: string;
  /** Order Id */
  order_id?: string | null;
}

/** GetOrderResponse */
export interface GetOrderResponse {
  order: AppApisOrdersOrder;
}

/** GetUserRequest */
export interface GetUserRequest {
  /**
   * Email
   * @format email
   */
  email: string;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/** InventoryAlert */
export interface InventoryAlert {
  /** Product Id */
  product_id: string;
  /** Product Name */
  product_name: string;
  /** Current Stock */
  current_stock: number;
  /** Threshold */
  threshold: number;
  /** Supplier Info */
  supplier_info?: string | null;
}

/** NotificationResponse */
export interface NotificationResponse {
  /** Success */
  success: boolean;
  /** Message */
  message: string;
}

/** OrderConfirmationEmail */
export interface OrderConfirmationEmail {
  /** Order Id */
  order_id: string;
  /** Customer Email */
  customer_email: string;
  /** Customer Name */
  customer_name: string;
  /** Order Items */
  order_items: Record<string, any>[];
  /** Shipping Info */
  shipping_info: Record<string, any>;
  /** Payment Method */
  payment_method: string;
  /** Order Total */
  order_total: number;
  /** Created At */
  created_at: string;
}

/** OrderItem */
export interface OrderItemInput {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Price */
  price: number;
  /** Image */
  image: string;
  /** Quantity */
  quantity: number;
  /** Category */
  category: string;
}

/** OrderSummary */
export interface OrderSummary {
  /** Total */
  total: number;
  /** Pending */
  pending: number;
  /** Processing */
  processing: number;
  /** Shipped */
  shipped: number;
  /** Delivered */
  delivered: number;
  /** Cancelled */
  cancelled: number;
}

/** OrderUpdate */
export interface OrderUpdate {
  /** Order Id */
  order_id: string;
  /** Customer Email */
  customer_email: string;
  /** Customer Name */
  customer_name: string;
  /** Old Status */
  old_status: string;
  /** New Status */
  new_status: string;
  /** Order Total */
  order_total?: number | null;
  /** Items Count */
  items_count?: number | null;
}

/** Product */
export interface Product {
  /** Name */
  name: string;
  /** Description */
  description: string;
  /** Price */
  price: number;
  /** Saleprice */
  salePrice?: number | null;
  /** Category */
  category: string;
  /** Stock */
  stock: number;
  /** Images */
  images: string[];
  /**
   * Featured
   * @default false
   */
  featured?: boolean;
  /** Brand */
  brand?: string | null;
  /** Material */
  material?: string | null;
  /** Dimensions */
  dimensions?: string | null;
  /** Weight */
  weight?: string | null;
  /** Warranty */
  warranty?: string | null;
  /**
   * Shopname
   * @default "Ahadu Market"
   */
  shopName?: string | null;
  /** Shippingprice */
  shippingPrice?: number | null;
  /** Suppliername */
  supplierName?: string | null;
  /** Supplierid */
  supplierId?: string | null;
  /** Specifications */
  specifications?: Record<string, any> | null;
  /** Id */
  id: string;
  /** Createdat */
  createdAt: string;
  /** Updatedat */
  updatedAt?: string | null;
  /** Rating */
  rating?: number | null;
  /**
   * Numreviews
   * @default 0
   */
  numReviews?: number;
  /**
   * Soldcount
   * @default 0
   */
  soldCount?: number;
}

/** ProductCreate */
export interface ProductCreate {
  /** Name */
  name: string;
  /** Description */
  description: string;
  /** Price */
  price: number;
  /** Saleprice */
  salePrice?: number | null;
  /** Category */
  category: string;
  /** Stock */
  stock: number;
  /** Images */
  images: string[];
  /**
   * Featured
   * @default false
   */
  featured?: boolean;
  /** Brand */
  brand?: string | null;
  /** Material */
  material?: string | null;
  /** Dimensions */
  dimensions?: string | null;
  /** Weight */
  weight?: string | null;
  /** Warranty */
  warranty?: string | null;
  /**
   * Shopname
   * @default "Ahadu Market"
   */
  shopName?: string | null;
  /** Shippingprice */
  shippingPrice?: number | null;
  /** Suppliername */
  supplierName?: string | null;
  /** Supplierid */
  supplierId?: string | null;
  /** Specifications */
  specifications?: Record<string, any> | null;
}

/** ProductResponse */
export interface ProductResponse {
  product: Product;
}

/** ProductUpdate */
export interface ProductUpdate {
  /** Name */
  name?: string | null;
  /** Description */
  description?: string | null;
  /** Price */
  price?: number | null;
  /** Saleprice */
  salePrice?: number | null;
  /** Category */
  category?: string | null;
  /** Stock */
  stock?: number | null;
  /** Images */
  images?: string[] | null;
  /** Featured */
  featured?: boolean | null;
  /** Shopname */
  shopName?: string | null;
  /** Brand */
  brand?: string | null;
  /** Material */
  material?: string | null;
  /** Dimensions */
  dimensions?: string | null;
  /** Weight */
  weight?: string | null;
  /** Warranty */
  warranty?: string | null;
  /** Shippingprice */
  shippingPrice?: number | null;
  /** Suppliername */
  supplierName?: string | null;
  /** Supplierid */
  supplierId?: string | null;
  /** Specifications */
  specifications?: Record<string, any> | null;
}

/** ProductsResponse */
export interface ProductsResponse {
  /** Products */
  products: Product[];
  /** Total */
  total: number;
}

/** Review */
export interface Review {
  /** Id */
  id: string;
  /** Productid */
  productId: string;
  /** Userid */
  userId: string;
  /** Rating */
  rating: number;
  /** Title */
  title?: string | null;
  /** Comment */
  comment: string;
  /** Username */
  userName: string;
  /** Createdat */
  createdAt: string;
  /** Updatedat */
  updatedAt?: string | null;
  /** Orderid */
  orderId?: string | null;
}

/** ReviewCreate */
export interface ReviewCreate {
  /** Productid */
  productId: string;
  /** Userid */
  userId: string;
  /**
   * Rating
   * @min 1
   * @max 5
   */
  rating: number;
  /** Title */
  title?: string | null;
  /** Comment */
  comment: string;
  /** Orderid */
  orderId?: string | null;
}

/** ReviewResponse */
export interface ReviewResponse {
  review: Review;
}

/** ReviewsResponse */
export interface ReviewsResponse {
  /** Reviews */
  reviews: Review[];
  /** Total */
  total: number;
  /** Averagerating */
  averageRating?: number | null;
}

/** ShippingInfo */
export interface ShippingInfo {
  /** Fullname */
  fullName: string;
  /** Email */
  email: string;
  /** Phone */
  phone: string;
  /** Address */
  address: string;
  /** City */
  city: string;
  /** State */
  state: string;
  /** Zipcode */
  zipCode: string;
  /** Country */
  country: string;
}

/** SupplierCreate */
export interface SupplierCreate {
  /** Name */
  name: string;
  /**
   * Email
   * @format email
   */
  email: string;
  /** Phone */
  phone?: string | null;
  /** Company */
  company?: string | null;
  /** Description */
  description?: string | null;
  /** Password */
  password: string;
}

/** SupplierResponse */
export interface SupplierResponse {
  /** Name */
  name: string;
  /**
   * Email
   * @format email
   */
  email: string;
  /** Phone */
  phone?: string | null;
  /** Company */
  company?: string | null;
  /** Description */
  description?: string | null;
  /** Id */
  id: string;
  /** Status */
  status: string;
  /** Createdat */
  createdAt: string;
  /** Updatedat */
  updatedAt?: string | null;
}

/** SupplierUpdate */
export interface SupplierUpdate {
  /** Name */
  name?: string | null;
  /** Phone */
  phone?: string | null;
  /** Company */
  company?: string | null;
  /** Description */
  description?: string | null;
  /** Status */
  status?: string | null;
}

/** SuppliersListResponse */
export interface SuppliersListResponse {
  /** Suppliers */
  suppliers: SupplierResponse[];
  /** Total */
  total: number;
}

/** TelegramResponse */
export interface TelegramResponse {
  /** Success */
  success: boolean;
  /** Message */
  message: string;
}

/** UpdateOrderStatusRequest */
export interface UpdateOrderStatusRequest {
  /** Status */
  status: string;
  /** Notes */
  notes?: string | null;
}

/** UpdateOrderStatusResponse */
export interface UpdateOrderStatusResponse {
  order: AppApisOrdersOrder;
  /** Message */
  message: string;
}

/** UpdateUserStatusRequest */
export interface UpdateUserStatusRequest {
  /** Status */
  status: string;
}

/** UpdateUserStatusResponse */
export interface UpdateUserStatusResponse {
  user: UserListItem;
  /** Message */
  message: string;
}

/** UserListItem */
export interface UserListItem {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Email */
  email: string;
  /** Phone */
  phone?: string | null;
  /** Role */
  role: string;
  /** Status */
  status: string;
  /** Createdat */
  createdAt: string;
}

/** UserListResponse */
export interface UserListResponse {
  /** Users */
  users: UserListItem[];
  /** Total */
  total: number;
}

/** UserLogin */
export interface UserLogin {
  /**
   * Email
   * @format email
   */
  email: string;
  /** Password */
  password: string;
}

/** UserLoginResponse */
export interface UserLoginResponse {
  user: UserResponse;
  /** Token */
  token: string;
}

/** UserRegistration */
export interface UserRegistration {
  /** Name */
  name: string;
  /**
   * Email
   * @format email
   */
  email: string;
  /** Password */
  password: string;
  /** Phone */
  phone?: string | null;
  /**
   * Role
   * @default "customer"
   */
  role?: string | null;
}

/** UserResponse */
export interface UserResponse {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Email */
  email: string;
  /** Phone */
  phone?: string | null;
  /** Createdat */
  createdAt: string;
  /** Role */
  role?: string | null;
  /** Company */
  company?: string | null;
  /** Description */
  description?: string | null;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

/** Order */
export interface AppApisDirectLookupOrder {
  /** Id */
  id: string;
  /** Userid */
  userId?: string | null;
  /** Items */
  items: AppApisDirectLookupOrderItem[];
  /** Totalamount */
  totalAmount: number;
  /** Status */
  status: string;
  /** Createdat */
  createdAt: string;
  /** Email */
  email?: string | null;
  /** Paymentmethod */
  paymentMethod?: string | null;
}

/** OrderItem */
export interface AppApisDirectLookupOrderItem {
  /** Id */
  id: string;
  /** Name */
  name?: string | null;
  /** Price */
  price: number;
  /** Quantity */
  quantity: number;
  /** Image */
  image?: string | null;
}

/** OrdersResponse */
export interface AppApisDirectLookupOrdersResponse {
  /** Orders */
  orders: AppApisDirectLookupOrder[];
  /** Total */
  total: number;
}

/** GetOrdersResponse */
export interface AppApisDirectOrdersGetOrdersResponse {
  /** Orders */
  orders: AppApisDirectOrdersOrder[];
  /** Total */
  total: number;
}

/** Order */
export interface AppApisDirectOrdersOrder {
  /** Id */
  id: string;
  /** Userid */
  userId?: string | null;
  /** Items */
  items: AppApisDirectOrdersOrderItem[];
  /** Totalamount */
  totalAmount: number;
  shippingInfo: ShippingInfo;
  /** Paymentmethod */
  paymentMethod: string;
  /** Paymentproof */
  paymentProof?: string | null;
  /** Status */
  status: string;
  /** Createdat */
  createdAt: string;
  /** Updatedat */
  updatedAt?: string | null;
  /** Notes */
  notes?: string | null;
}

/** OrderItem */
export interface AppApisDirectOrdersOrderItem {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Price */
  price: number;
  /** Image */
  image: string;
  /** Quantity */
  quantity: number;
  /** Category */
  category: string;
}

/** Order */
export interface AppApisOrderLookupOrder {
  /** Id */
  id: string;
  /** Userid */
  userId?: string | null;
  /** Items */
  items: AppApisOrderLookupOrderItem[];
  /** Totalamount */
  totalAmount: number;
  /** Status */
  status: string;
  /** Createdat */
  createdAt: string;
  /** Email */
  email?: string | null;
  /** Paymentmethod */
  paymentMethod?: string | null;
}

/** OrderItem */
export interface AppApisOrderLookupOrderItem {
  /** Id */
  id: string;
  /** Name */
  name?: string | null;
  /** Price */
  price: number;
  /** Quantity */
  quantity: number;
  /** Image */
  image?: string | null;
}

/** OrdersResponse */
export interface AppApisOrderLookupOrdersResponse {
  /** Orders */
  orders: AppApisOrderLookupOrder[];
  /** Total */
  total: number;
}

/** GetOrdersResponse */
export interface AppApisOrdersGetOrdersResponse {
  /** Orders */
  orders: AppApisOrdersOrder[];
  /** Total */
  total: number;
}

/** Order */
export interface AppApisOrdersOrder {
  /** Id */
  id: string;
  /** Userid */
  userId?: string | null;
  /** Items */
  items: AppApisOrdersOrderItem[];
  /** Totalamount */
  totalAmount: number;
  shippingInfo: ShippingInfo;
  /** Paymentmethod */
  paymentMethod: string;
  /** Paymentproof */
  paymentProof?: string | null;
  /** Status */
  status: string;
  /** Createdat */
  createdAt: string;
  /** Updatedat */
  updatedAt?: string | null;
  /** Notes */
  notes?: string | null;
}

/** OrderItem */
export interface AppApisOrdersOrderItem {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Price */
  price: number;
  /** Image */
  image: string;
  /** Quantity */
  quantity: number;
  /** Category */
  category: string;
}

export type CheckHealthData = HealthResponse;

export type TestTelegramNotificationData = TelegramResponse;

export interface GetAllUsersParams {
  /**
   * Role
   * Filter by user role
   */
  role?: string | null;
  /**
   * Status
   * Filter by user status
   */
  status?: string | null;
  /**
   * Page
   * @min 1
   * @default 1
   */
  page?: number;
  /**
   * Limit
   * @min 1
   * @max 100
   * @default 20
   */
  limit?: number;
}

export type GetAllUsersData = UserListResponse;

export type GetAllUsersError = HTTPValidationError;

export interface UpdateUserStatusParams {
  /** User Id */
  userId: string;
}

export type UpdateUserStatusData = UpdateUserStatusResponse;

export type UpdateUserStatusError = HTTPValidationError;

export interface DeleteUserParams {
  /** User Id */
  userId: string;
}

/** Response Delete User */
export type DeleteUserData = Record<string, any>;

export type DeleteUserError = HTTPValidationError;

export interface GetDirectUserOrdersParams {
  /** Email */
  email: string;
}

export type GetDirectUserOrdersData = AppApisDirectOrdersGetOrdersResponse;

export type GetDirectUserOrdersError = HTTPValidationError;

export interface LookupOrdersParams {
  /** Email */
  email: string;
}

export type LookupOrdersData = AppApisOrderLookupOrdersResponse;

export type LookupOrdersError = HTTPValidationError;

export interface DirectLookupOrdersParams {
  /** Email */
  email: string;
}

export type DirectLookupOrdersData = AppApisDirectLookupOrdersResponse;

export type DirectLookupOrdersError = HTTPValidationError;

export type CreateReviewData = ReviewResponse;

export type CreateReviewError = HTTPValidationError;

export interface GetProductReviewsParams {
  /**
   * Page
   * @min 1
   * @default 1
   */
  page?: number;
  /**
   * Limit
   * @min 1
   * @max 50
   * @default 10
   */
  limit?: number;
  /**
   * Product Id
   * The ID of the product to get reviews for
   */
  productId: string;
}

export type GetProductReviewsData = ReviewsResponse;

export type GetProductReviewsError = HTTPValidationError;

export interface GetUserReviewsParams {
  /**
   * Page
   * @min 1
   * @default 1
   */
  page?: number;
  /**
   * Limit
   * @min 1
   * @max 50
   * @default 10
   */
  limit?: number;
  /**
   * User Id
   * The ID of the user to get reviews for
   */
  userId: string;
}

export type GetUserReviewsData = ReviewsResponse;

export type GetUserReviewsError = HTTPValidationError;

export interface DeleteReviewParams {
  /** Review Id */
  reviewId: string;
}

/** Response Delete Review */
export type DeleteReviewData = Record<string, any>;

export type DeleteReviewError = HTTPValidationError;

export type SendCustomerNotificationData = NotificationResponse;

export type SendCustomerNotificationError = HTTPValidationError;

export type SendInventoryAlertData = NotificationResponse;

export type SendInventoryAlertError = HTTPValidationError;

export type SendOrderStatusUpdateData = NotificationResponse;

export type SendOrderStatusUpdateError = HTTPValidationError;

export type SendOrderConfirmationEmailData = NotificationResponse;

export type SendOrderConfirmationEmailError = HTTPValidationError;

export type CreateProductData = ProductResponse;

export type CreateProductError = HTTPValidationError;

export interface GetProductsParams {
  /** Category */
  category?: string | null;
  /** Search */
  search?: string | null;
  /** Featured */
  featured?: boolean | null;
  /** Min Price */
  min_price?: number | null;
  /** Max Price */
  max_price?: number | null;
  /** Supplier Id */
  supplier_id?: string | null;
  /**
   * Page
   * @min 1
   * @default 1
   */
  page?: number;
  /**
   * Limit
   * @min 1
   * @max 100
   * @default 20
   */
  limit?: number;
  /**
   * Sort By
   * @default "createdAt"
   */
  sort_by?: string;
  /**
   * Sort Order
   * @default "desc"
   */
  sort_order?: string;
}

export type GetProductsData = ProductsResponse;

export type GetProductsError = HTTPValidationError;

export type GetCategoriesData = CategoryResponse;

export interface GetFeaturedProductsParams {
  /**
   * Limit
   * @min 1
   * @max 20
   * @default 8
   */
  limit?: number;
}

export type GetFeaturedProductsData = ProductsResponse;

export type GetFeaturedProductsError = HTTPValidationError;

export interface GetProductParams {
  /**
   * Product Id
   * The ID of the product to retrieve
   */
  productId: string;
}

export type GetProductData = ProductResponse;

export type GetProductError = HTTPValidationError;

export interface UpdateProductParams {
  /** Product Id */
  productId: string;
}

export type UpdateProductData = ProductResponse;

export type UpdateProductError = HTTPValidationError;

export interface DeleteProductParams {
  /** Product Id */
  productId: string;
}

/** Response Delete Product */
export type DeleteProductData = Record<string, any>;

export type DeleteProductError = HTTPValidationError;

export type CreateSupplierData = SupplierResponse;

export type CreateSupplierError = HTTPValidationError;

export interface GetSuppliersParams {
  /**
   * Status
   * Filter by supplier status
   */
  status?: string | null;
  /**
   * Search
   * Search by name or email
   */
  search?: string | null;
  /**
   * Page
   * @min 1
   * @default 1
   */
  page?: number;
  /**
   * Limit
   * @min 1
   * @max 100
   * @default 20
   */
  limit?: number;
}

export type GetSuppliersData = SuppliersListResponse;

export type GetSuppliersError = HTTPValidationError;

export interface GetSupplierParams {
  /**
   * Supplier Id
   * The ID of the supplier to retrieve
   */
  supplierId: string;
}

export type GetSupplierData = SupplierResponse;

export type GetSupplierError = HTTPValidationError;

export interface UpdateSupplierParams {
  /** Supplier Id */
  supplierId: string;
}

export type UpdateSupplierData = SupplierResponse;

export type UpdateSupplierError = HTTPValidationError;

export interface DeleteSupplierParams {
  /** Supplier Id */
  supplierId: string;
}

/** Response Delete Supplier */
export type DeleteSupplierData = Record<string, any>;

export type DeleteSupplierError = HTTPValidationError;

export interface GetSupplierProductsParams {
  /** Supplier Id */
  supplier_id: string;
}

/** Response Get Supplier Products */
export type GetSupplierProductsData = Record<string, any>;

export type GetSupplierProductsError = HTTPValidationError;

export interface GetSupplierOrdersParams {
  /** Supplier Id */
  supplier_id: string;
}

/** Response Get Supplier Orders */
export type GetSupplierOrdersData = Record<string, any>;

export type GetSupplierOrdersError = HTTPValidationError;

export type RegisterUserData = UserResponse;

export type RegisterUserError = HTTPValidationError;

export type LoginUserData = UserLoginResponse;

export type LoginUserError = HTTPValidationError;

export type GetUserData = UserResponse;

export type GetUserError = HTTPValidationError;

export interface CreateAddressParams {
  /** User Id */
  user_id: string;
}

export type CreateAddressData = AddressResponse;

export type CreateAddressError = HTTPValidationError;

export interface GetUserAddressesParams {
  /** User Id */
  userId: string;
}

export type GetUserAddressesData = AddressesResponse;

export type GetUserAddressesError = HTTPValidationError;

/** User List */
export type MigrateLocalUsersPayload = Record<string, any>[];

/** Response Migrate Local Users */
export type MigrateLocalUsersData = Record<string, any>;

export type MigrateLocalUsersError = HTTPValidationError;

export type GetOrderSummaryData = OrderSummary;

export type CreateOrderData = CreateOrderResponse;

export type CreateOrderError = HTTPValidationError;

export interface GetAllOrdersParams {
  /** Status */
  status?: string | null;
  /**
   * Page
   * @min 1
   * @default 1
   */
  page?: number;
  /**
   * Limit
   * @min 1
   * @max 100
   * @default 20
   */
  limit?: number;
}

export type GetAllOrdersData = AppApisOrdersGetOrdersResponse;

export type GetAllOrdersError = HTTPValidationError;

export interface GetUserOrdersParams {
  /**
   * Email
   * Email of the user to get orders for
   */
  email?: string | null;
  /**
   * User Id
   * ID of the user to get orders for
   */
  user_id?: string | null;
  /** Status */
  status?: string | null;
  /**
   * Page
   * @min 1
   * @default 1
   */
  page?: number;
  /**
   * Limit
   * @min 1
   * @max 50
   * @default 10
   */
  limit?: number;
}

export type GetUserOrdersData = AppApisOrdersGetOrdersResponse;

export type GetUserOrdersError = HTTPValidationError;

export interface GetOrderParams {
  /**
   * Order Id
   * The ID of the order to retrieve
   */
  orderId: string;
}

export type GetOrderData = GetOrderResponse;

export type GetOrderError = HTTPValidationError;

export interface UpdateOrderStatusParams {
  /** Order Id */
  orderId: string;
}

export type UpdateOrderStatusData = UpdateOrderStatusResponse;

export type UpdateOrderStatusError = HTTPValidationError;

export type GetEthiopianCategoriesData = CategoryResponse;
