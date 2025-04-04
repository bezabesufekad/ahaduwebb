import {
  AddressCreate,
  CheckHealthData,
  CreateAddressData,
  CreateAddressError,
  CreateAddressParams,
  CreateOrderData,
  CreateOrderError,
  CreateOrderRequest,
  CreateProductData,
  CreateProductError,
  CreateReviewData,
  CreateReviewError,
  CreateSupplierData,
  CreateSupplierError,
  CustomerNotification,
  DeleteProductData,
  DeleteProductError,
  DeleteProductParams,
  DeleteReviewData,
  DeleteReviewError,
  DeleteReviewParams,
  DeleteSupplierData,
  DeleteSupplierError,
  DeleteSupplierParams,
  DeleteUserData,
  DeleteUserError,
  DeleteUserParams,
  DirectLookupOrdersData,
  DirectLookupOrdersError,
  DirectLookupOrdersParams,
  GetAllOrdersData,
  GetAllOrdersError,
  GetAllOrdersParams,
  GetAllUsersData,
  GetAllUsersError,
  GetAllUsersParams,
  GetCategoriesData,
  GetDirectUserOrdersData,
  GetDirectUserOrdersError,
  GetDirectUserOrdersParams,
  GetEthiopianCategoriesData,
  GetFeaturedProductsData,
  GetFeaturedProductsError,
  GetFeaturedProductsParams,
  GetOrderData,
  GetOrderError,
  GetOrderParams,
  GetOrderSummaryData,
  GetProductData,
  GetProductError,
  GetProductParams,
  GetProductReviewsData,
  GetProductReviewsError,
  GetProductReviewsParams,
  GetProductsData,
  GetProductsError,
  GetProductsParams,
  GetSupplierData,
  GetSupplierError,
  GetSupplierOrdersData,
  GetSupplierOrdersError,
  GetSupplierOrdersParams,
  GetSupplierParams,
  GetSupplierProductsData,
  GetSupplierProductsError,
  GetSupplierProductsParams,
  GetSuppliersData,
  GetSuppliersError,
  GetSuppliersParams,
  GetUserAddressesData,
  GetUserAddressesError,
  GetUserAddressesParams,
  GetUserData,
  GetUserError,
  GetUserOrdersData,
  GetUserOrdersError,
  GetUserOrdersParams,
  GetUserRequest,
  GetUserReviewsData,
  GetUserReviewsError,
  GetUserReviewsParams,
  InventoryAlert,
  LoginUserData,
  LoginUserError,
  LookupOrdersData,
  LookupOrdersError,
  LookupOrdersParams,
  MigrateLocalUsersData,
  MigrateLocalUsersError,
  MigrateLocalUsersPayload,
  OrderConfirmationEmail,
  OrderUpdate,
  ProductCreate,
  ProductUpdate,
  RegisterUserData,
  RegisterUserError,
  ReviewCreate,
  SendCustomerNotificationData,
  SendCustomerNotificationError,
  SendInventoryAlertData,
  SendInventoryAlertError,
  SendOrderConfirmationEmailData,
  SendOrderConfirmationEmailError,
  SendOrderStatusUpdateData,
  SendOrderStatusUpdateError,
  SupplierCreate,
  SupplierUpdate,
  TestTelegramNotificationData,
  UpdateOrderStatusData,
  UpdateOrderStatusError,
  UpdateOrderStatusParams,
  UpdateOrderStatusRequest,
  UpdateProductData,
  UpdateProductError,
  UpdateProductParams,
  UpdateSupplierData,
  UpdateSupplierError,
  UpdateSupplierParams,
  UpdateUserStatusData,
  UpdateUserStatusError,
  UpdateUserStatusParams,
  UpdateUserStatusRequest,
  UserLogin,
  UserRegistration,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Brain<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   *
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthData, any>({
      path: `/_healthz`,
      method: "GET",
      ...params,
    });

  /**
   * @description Send a test notification to Telegram
   *
   * @tags dbtn/module:telegram
   * @name test_telegram_notification
   * @summary Test Telegram Notification
   * @request POST:/routes/telegram/test
   */
  test_telegram_notification = (params: RequestParams = {}) =>
    this.request<TestTelegramNotificationData, any>({
      path: `/routes/telegram/test`,
      method: "POST",
      ...params,
    });

  /**
   * @description Get all users with optional filtering and pagination
   *
   * @tags dbtn/module:admin_users
   * @name get_all_users
   * @summary Get All Users
   * @request GET:/routes/admin/users
   */
  get_all_users = (query: GetAllUsersParams, params: RequestParams = {}) =>
    this.request<GetAllUsersData, GetAllUsersError>({
      path: `/routes/admin/users`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Update the status of a user
   *
   * @tags dbtn/module:admin_users
   * @name update_user_status
   * @summary Update User Status
   * @request PUT:/routes/admin/users/{user_id}/status
   */
  update_user_status = (
    { userId, ...query }: UpdateUserStatusParams,
    data: UpdateUserStatusRequest,
    params: RequestParams = {},
  ) =>
    this.request<UpdateUserStatusData, UpdateUserStatusError>({
      path: `/routes/admin/users/${userId}/status`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Delete a user
   *
   * @tags dbtn/module:admin_users
   * @name delete_user
   * @summary Delete User
   * @request DELETE:/routes/admin/users/{user_id}
   */
  delete_user = ({ userId, ...query }: DeleteUserParams, params: RequestParams = {}) =>
    this.request<DeleteUserData, DeleteUserError>({
      path: `/routes/admin/users/${userId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Get orders for a user directly, performing case-insensitive matching and using all available data
   *
   * @tags direct-orders, dbtn/module:direct_orders
   * @name get_direct_user_orders
   * @summary Get Direct User Orders
   * @request GET:/routes/direct-user-orders
   */
  get_direct_user_orders = (query: GetDirectUserOrdersParams, params: RequestParams = {}) =>
    this.request<GetDirectUserOrdersData, GetDirectUserOrdersError>({
      path: `/routes/direct-user-orders`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get orders for a user by email - reliable direct DB access
   *
   * @tags order-lookup, dbtn/module:order_lookup
   * @name lookup_orders
   * @summary Lookup Orders
   * @request GET:/routes/lookup-orders
   */
  lookup_orders = (query: LookupOrdersParams, params: RequestParams = {}) =>
    this.request<LookupOrdersData, LookupOrdersError>({
      path: `/routes/lookup-orders`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get orders for a user by email - most direct DB access with exhaustive matching
   *
   * @tags direct-lookup, dbtn/module:direct_lookup
   * @name direct_lookup_orders
   * @summary Direct Lookup Orders
   * @request GET:/routes/direct-lookup-orders
   */
  direct_lookup_orders = (query: DirectLookupOrdersParams, params: RequestParams = {}) =>
    this.request<DirectLookupOrdersData, DirectLookupOrdersError>({
      path: `/routes/direct-lookup-orders`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Create a new review for a product
   *
   * @tags dbtn/module:reviews
   * @name create_review
   * @summary Create Review
   * @request POST:/routes/reviews
   */
  create_review = (data: ReviewCreate, params: RequestParams = {}) =>
    this.request<CreateReviewData, CreateReviewError>({
      path: `/routes/reviews`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get all reviews for a product
   *
   * @tags dbtn/module:reviews
   * @name get_product_reviews
   * @summary Get Product Reviews
   * @request GET:/routes/reviews/product/{product_id}
   */
  get_product_reviews = ({ productId, ...query }: GetProductReviewsParams, params: RequestParams = {}) =>
    this.request<GetProductReviewsData, GetProductReviewsError>({
      path: `/routes/reviews/product/${productId}`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get all reviews by a user
   *
   * @tags dbtn/module:reviews
   * @name get_user_reviews
   * @summary Get User Reviews
   * @request GET:/routes/reviews/user/{user_id}
   */
  get_user_reviews = ({ userId, ...query }: GetUserReviewsParams, params: RequestParams = {}) =>
    this.request<GetUserReviewsData, GetUserReviewsError>({
      path: `/routes/reviews/user/${userId}`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Delete a review
   *
   * @tags dbtn/module:reviews
   * @name delete_review
   * @summary Delete Review
   * @request DELETE:/routes/reviews/{review_id}
   */
  delete_review = ({ reviewId, ...query }: DeleteReviewParams, params: RequestParams = {}) =>
    this.request<DeleteReviewData, DeleteReviewError>({
      path: `/routes/reviews/${reviewId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Send a notification to a customer via telegram (as a demonstration)
   *
   * @tags dbtn/module:notification
   * @name send_customer_notification
   * @summary Send Customer Notification
   * @request POST:/routes/send-customer-notification
   */
  send_customer_notification = (data: CustomerNotification, params: RequestParams = {}) =>
    this.request<SendCustomerNotificationData, SendCustomerNotificationError>({
      path: `/routes/send-customer-notification`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Send an inventory alert to administrators
   *
   * @tags dbtn/module:notification
   * @name send_inventory_alert
   * @summary Send Inventory Alert
   * @request POST:/routes/send-inventory-alert
   */
  send_inventory_alert = (data: InventoryAlert, params: RequestParams = {}) =>
    this.request<SendInventoryAlertData, SendInventoryAlertError>({
      path: `/routes/send-inventory-alert`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Send an order status update notification to both customer and admin
   *
   * @tags dbtn/module:notification
   * @name send_order_status_update
   * @summary Send Order Status Update
   * @request POST:/routes/send-order-status-update
   */
  send_order_status_update = (data: OrderUpdate, params: RequestParams = {}) =>
    this.request<SendOrderStatusUpdateData, SendOrderStatusUpdateError>({
      path: `/routes/send-order-status-update`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Send an order confirmation email to the customer
   *
   * @tags dbtn/module:notification
   * @name send_order_confirmation_email
   * @summary Send Order Confirmation Email
   * @request POST:/routes/send-order-confirmation-email
   */
  send_order_confirmation_email = (data: OrderConfirmationEmail, params: RequestParams = {}) =>
    this.request<SendOrderConfirmationEmailData, SendOrderConfirmationEmailError>({
      path: `/routes/send-order-confirmation-email`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Create a new product
   *
   * @tags dbtn/module:products
   * @name create_product
   * @summary Create Product
   * @request POST:/routes/products
   */
  create_product = (data: ProductCreate, params: RequestParams = {}) =>
    this.request<CreateProductData, CreateProductError>({
      path: `/routes/products`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get all products with filtering, pagination and sorting
   *
   * @tags dbtn/module:products
   * @name get_products
   * @summary Get Products
   * @request GET:/routes/products
   */
  get_products = (query: GetProductsParams, params: RequestParams = {}) =>
    this.request<GetProductsData, GetProductsError>({
      path: `/routes/products`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get all product categories
   *
   * @tags dbtn/module:products
   * @name get_categories
   * @summary Get Categories
   * @request GET:/routes/products/categories
   */
  get_categories = (params: RequestParams = {}) =>
    this.request<GetCategoriesData, any>({
      path: `/routes/products/categories`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get featured products
   *
   * @tags dbtn/module:products
   * @name get_featured_products
   * @summary Get Featured Products
   * @request GET:/routes/products/featured
   */
  get_featured_products = (query: GetFeaturedProductsParams, params: RequestParams = {}) =>
    this.request<GetFeaturedProductsData, GetFeaturedProductsError>({
      path: `/routes/products/featured`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get a specific product by ID
   *
   * @tags dbtn/module:products
   * @name get_product
   * @summary Get Product
   * @request GET:/routes/products/{product_id}
   */
  get_product = ({ productId, ...query }: GetProductParams, params: RequestParams = {}) =>
    this.request<GetProductData, GetProductError>({
      path: `/routes/products/${productId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update a product
   *
   * @tags dbtn/module:products
   * @name update_product
   * @summary Update Product
   * @request PUT:/routes/products/{product_id}
   */
  update_product = ({ productId, ...query }: UpdateProductParams, data: ProductUpdate, params: RequestParams = {}) =>
    this.request<UpdateProductData, UpdateProductError>({
      path: `/routes/products/${productId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Delete a product
   *
   * @tags dbtn/module:products
   * @name delete_product
   * @summary Delete Product
   * @request DELETE:/routes/products/{product_id}
   */
  delete_product = ({ productId, ...query }: DeleteProductParams, params: RequestParams = {}) =>
    this.request<DeleteProductData, DeleteProductError>({
      path: `/routes/products/${productId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Create a new supplier account (admin only)
   *
   * @tags dbtn/module:suppliers
   * @name create_supplier
   * @summary Create Supplier
   * @request POST:/routes/admin/suppliers
   */
  create_supplier = (data: SupplierCreate, params: RequestParams = {}) =>
    this.request<CreateSupplierData, CreateSupplierError>({
      path: `/routes/admin/suppliers`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get all suppliers with filtering and pagination (admin only)
   *
   * @tags dbtn/module:suppliers
   * @name get_suppliers
   * @summary Get Suppliers
   * @request GET:/routes/admin/suppliers
   */
  get_suppliers = (query: GetSuppliersParams, params: RequestParams = {}) =>
    this.request<GetSuppliersData, GetSuppliersError>({
      path: `/routes/admin/suppliers`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get a specific supplier by ID (admin only)
   *
   * @tags dbtn/module:suppliers
   * @name get_supplier
   * @summary Get Supplier
   * @request GET:/routes/admin/suppliers/{supplier_id}
   */
  get_supplier = ({ supplierId, ...query }: GetSupplierParams, params: RequestParams = {}) =>
    this.request<GetSupplierData, GetSupplierError>({
      path: `/routes/admin/suppliers/${supplierId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update a supplier (admin only)
   *
   * @tags dbtn/module:suppliers
   * @name update_supplier
   * @summary Update Supplier
   * @request PUT:/routes/admin/suppliers/{supplier_id}
   */
  update_supplier = (
    { supplierId, ...query }: UpdateSupplierParams,
    data: SupplierUpdate,
    params: RequestParams = {},
  ) =>
    this.request<UpdateSupplierData, UpdateSupplierError>({
      path: `/routes/admin/suppliers/${supplierId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Delete a supplier (admin only)
   *
   * @tags dbtn/module:suppliers
   * @name delete_supplier
   * @summary Delete Supplier
   * @request DELETE:/routes/admin/suppliers/{supplier_id}
   */
  delete_supplier = ({ supplierId, ...query }: DeleteSupplierParams, params: RequestParams = {}) =>
    this.request<DeleteSupplierData, DeleteSupplierError>({
      path: `/routes/admin/suppliers/${supplierId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Get products for a specific supplier (supplier dashboard)
   *
   * @tags dbtn/module:suppliers
   * @name get_supplier_products
   * @summary Get Supplier Products
   * @request GET:/routes/suppliers/products
   */
  get_supplier_products = (query: GetSupplierProductsParams, params: RequestParams = {}) =>
    this.request<GetSupplierProductsData, GetSupplierProductsError>({
      path: `/routes/suppliers/products`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get orders containing products from a specific supplier (supplier dashboard)
   *
   * @tags dbtn/module:suppliers
   * @name get_supplier_orders
   * @summary Get Supplier Orders
   * @request GET:/routes/suppliers/orders
   */
  get_supplier_orders = (query: GetSupplierOrdersParams, params: RequestParams = {}) =>
    this.request<GetSupplierOrdersData, GetSupplierOrdersError>({
      path: `/routes/suppliers/orders`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Register a new user
   *
   * @tags dbtn/module:user_auth
   * @name register_user
   * @summary Register User
   * @request POST:/routes/register
   */
  register_user = (data: UserRegistration, params: RequestParams = {}) =>
    this.request<RegisterUserData, RegisterUserError>({
      path: `/routes/register`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Login a user
   *
   * @tags dbtn/module:user_auth
   * @name login_user
   * @summary Login User
   * @request POST:/routes/login
   */
  login_user = (data: UserLogin, params: RequestParams = {}) =>
    this.request<LoginUserData, LoginUserError>({
      path: `/routes/login`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get user by email
   *
   * @tags dbtn/module:user_auth
   * @name get_user
   * @summary Get User
   * @request POST:/routes/get-user
   */
  get_user = (data: GetUserRequest, params: RequestParams = {}) =>
    this.request<GetUserData, GetUserError>({
      path: `/routes/get-user`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Create a new address for a user
   *
   * @tags dbtn/module:user_auth
   * @name create_address
   * @summary Create Address
   * @request POST:/routes/addresses/create
   */
  create_address = (query: CreateAddressParams, data: AddressCreate, params: RequestParams = {}) =>
    this.request<CreateAddressData, CreateAddressError>({
      path: `/routes/addresses/create`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get all addresses for a user
   *
   * @tags dbtn/module:user_auth
   * @name get_user_addresses
   * @summary Get User Addresses
   * @request GET:/routes/addresses/{user_id}
   */
  get_user_addresses = ({ userId, ...query }: GetUserAddressesParams, params: RequestParams = {}) =>
    this.request<GetUserAddressesData, GetUserAddressesError>({
      path: `/routes/addresses/${userId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Migrate users from localStorage to backend storage
   *
   * @tags dbtn/module:user_auth
   * @name migrate_local_users
   * @summary Migrate Local Users
   * @request POST:/routes/migrate-users
   */
  migrate_local_users = (data: MigrateLocalUsersPayload, params: RequestParams = {}) =>
    this.request<MigrateLocalUsersData, MigrateLocalUsersError>({
      path: `/routes/migrate-users`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get a summary of orders by status
   *
   * @tags dbtn/module:orders
   * @name get_order_summary
   * @summary Get Order Summary
   * @request GET:/routes/orders/summary
   */
  get_order_summary = (params: RequestParams = {}) =>
    this.request<GetOrderSummaryData, any>({
      path: `/routes/orders/summary`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a new order
   *
   * @tags dbtn/module:orders
   * @name create_order
   * @summary Create Order
   * @request POST:/routes/orders/create
   */
  create_order = (data: CreateOrderRequest, params: RequestParams = {}) =>
    this.request<CreateOrderData, CreateOrderError>({
      path: `/routes/orders/create`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get all orders with optional filtering and pagination
   *
   * @tags dbtn/module:orders
   * @name get_all_orders
   * @summary Get All Orders
   * @request GET:/routes/orders/all
   */
  get_all_orders = (query: GetAllOrdersParams, params: RequestParams = {}) =>
    this.request<GetAllOrdersData, GetAllOrdersError>({
      path: `/routes/orders/all`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get all orders for a specific user
   *
   * @tags dbtn/module:orders
   * @name get_user_orders
   * @summary Get User Orders
   * @request GET:/routes/orders/user
   */
  get_user_orders = (query: GetUserOrdersParams, params: RequestParams = {}) =>
    this.request<GetUserOrdersData, GetUserOrdersError>({
      path: `/routes/orders/user`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get a specific order by ID
   *
   * @tags dbtn/module:orders
   * @name get_order
   * @summary Get Order
   * @request GET:/routes/orders/{order_id}
   */
  get_order = ({ orderId, ...query }: GetOrderParams, params: RequestParams = {}) =>
    this.request<GetOrderData, GetOrderError>({
      path: `/routes/orders/${orderId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update the status of an order
   *
   * @tags dbtn/module:orders
   * @name update_order_status
   * @summary Update Order Status
   * @request PUT:/routes/orders/{order_id}/status
   */
  update_order_status = (
    { orderId, ...query }: UpdateOrderStatusParams,
    data: UpdateOrderStatusRequest,
    params: RequestParams = {},
  ) =>
    this.request<UpdateOrderStatusData, UpdateOrderStatusError>({
      path: `/routes/orders/${orderId}/status`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get list of Ethiopian product categories
   *
   * @tags dbtn/module:categories
   * @name get_ethiopian_categories
   * @summary Get Ethiopian Categories
   * @request GET:/routes/categories
   */
  get_ethiopian_categories = (params: RequestParams = {}) =>
    this.request<GetEthiopianCategoriesData, any>({
      path: `/routes/categories`,
      method: "GET",
      ...params,
    });
}
