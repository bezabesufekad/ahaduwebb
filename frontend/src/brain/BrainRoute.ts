import {
  AddressCreate,
  CheckHealthData,
  CreateAddressData,
  CreateOrderData,
  CreateOrderRequest,
  CreateProductData,
  CreateReviewData,
  CreateSupplierData,
  CustomerNotification,
  DeleteProductData,
  DeleteReviewData,
  DeleteSupplierData,
  DeleteUserData,
  DirectLookupOrdersData,
  GetAllOrdersData,
  GetAllUsersData,
  GetCategoriesData,
  GetDirectUserOrdersData,
  GetEthiopianCategoriesData,
  GetFeaturedProductsData,
  GetOrderData,
  GetOrderSummaryData,
  GetProductData,
  GetProductReviewsData,
  GetProductsData,
  GetSupplierData,
  GetSupplierOrdersData,
  GetSupplierProductsData,
  GetSuppliersData,
  GetUserAddressesData,
  GetUserData,
  GetUserOrdersData,
  GetUserRequest,
  GetUserReviewsData,
  InventoryAlert,
  LoginUserData,
  LookupOrdersData,
  MigrateLocalUsersData,
  MigrateLocalUsersPayload,
  OrderConfirmationEmail,
  OrderUpdate,
  ProductCreate,
  ProductUpdate,
  RegisterUserData,
  ReviewCreate,
  SendCustomerNotificationData,
  SendInventoryAlertData,
  SendOrderConfirmationEmailData,
  SendOrderStatusUpdateData,
  SupplierCreate,
  SupplierUpdate,
  TestTelegramNotificationData,
  UpdateOrderStatusData,
  UpdateOrderStatusRequest,
  UpdateProductData,
  UpdateSupplierData,
  UpdateUserStatusData,
  UpdateUserStatusRequest,
  UserLogin,
  UserRegistration,
} from "./data-contracts";

export namespace Brain {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthData;
  }

  /**
   * @description Send a test notification to Telegram
   * @tags dbtn/module:telegram
   * @name test_telegram_notification
   * @summary Test Telegram Notification
   * @request POST:/routes/telegram/test
   */
  export namespace test_telegram_notification {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TestTelegramNotificationData;
  }

  /**
   * @description Get all users with optional filtering and pagination
   * @tags dbtn/module:admin_users
   * @name get_all_users
   * @summary Get All Users
   * @request GET:/routes/admin/users
   */
  export namespace get_all_users {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAllUsersData;
  }

  /**
   * @description Update the status of a user
   * @tags dbtn/module:admin_users
   * @name update_user_status
   * @summary Update User Status
   * @request PUT:/routes/admin/users/{user_id}/status
   */
  export namespace update_user_status {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateUserStatusRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateUserStatusData;
  }

  /**
   * @description Delete a user
   * @tags dbtn/module:admin_users
   * @name delete_user
   * @summary Delete User
   * @request DELETE:/routes/admin/users/{user_id}
   */
  export namespace delete_user {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteUserData;
  }

  /**
   * @description Get orders for a user directly, performing case-insensitive matching and using all available data
   * @tags direct-orders, dbtn/module:direct_orders
   * @name get_direct_user_orders
   * @summary Get Direct User Orders
   * @request GET:/routes/direct-user-orders
   */
  export namespace get_direct_user_orders {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Email */
      email: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetDirectUserOrdersData;
  }

  /**
   * @description Get orders for a user by email - reliable direct DB access
   * @tags order-lookup, dbtn/module:order_lookup
   * @name lookup_orders
   * @summary Lookup Orders
   * @request GET:/routes/lookup-orders
   */
  export namespace lookup_orders {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Email */
      email: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = LookupOrdersData;
  }

  /**
   * @description Get orders for a user by email - most direct DB access with exhaustive matching
   * @tags direct-lookup, dbtn/module:direct_lookup
   * @name direct_lookup_orders
   * @summary Direct Lookup Orders
   * @request GET:/routes/direct-lookup-orders
   */
  export namespace direct_lookup_orders {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Email */
      email: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DirectLookupOrdersData;
  }

  /**
   * @description Create a new review for a product
   * @tags dbtn/module:reviews
   * @name create_review
   * @summary Create Review
   * @request POST:/routes/reviews
   */
  export namespace create_review {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ReviewCreate;
    export type RequestHeaders = {};
    export type ResponseBody = CreateReviewData;
  }

  /**
   * @description Get all reviews for a product
   * @tags dbtn/module:reviews
   * @name get_product_reviews
   * @summary Get Product Reviews
   * @request GET:/routes/reviews/product/{product_id}
   */
  export namespace get_product_reviews {
    export type RequestParams = {
      /**
       * Product Id
       * The ID of the product to get reviews for
       */
      productId: string;
    };
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetProductReviewsData;
  }

  /**
   * @description Get all reviews by a user
   * @tags dbtn/module:reviews
   * @name get_user_reviews
   * @summary Get User Reviews
   * @request GET:/routes/reviews/user/{user_id}
   */
  export namespace get_user_reviews {
    export type RequestParams = {
      /**
       * User Id
       * The ID of the user to get reviews for
       */
      userId: string;
    };
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserReviewsData;
  }

  /**
   * @description Delete a review
   * @tags dbtn/module:reviews
   * @name delete_review
   * @summary Delete Review
   * @request DELETE:/routes/reviews/{review_id}
   */
  export namespace delete_review {
    export type RequestParams = {
      /** Review Id */
      reviewId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteReviewData;
  }

  /**
   * @description Send a notification to a customer via telegram (as a demonstration)
   * @tags dbtn/module:notification
   * @name send_customer_notification
   * @summary Send Customer Notification
   * @request POST:/routes/send-customer-notification
   */
  export namespace send_customer_notification {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CustomerNotification;
    export type RequestHeaders = {};
    export type ResponseBody = SendCustomerNotificationData;
  }

  /**
   * @description Send an inventory alert to administrators
   * @tags dbtn/module:notification
   * @name send_inventory_alert
   * @summary Send Inventory Alert
   * @request POST:/routes/send-inventory-alert
   */
  export namespace send_inventory_alert {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = InventoryAlert;
    export type RequestHeaders = {};
    export type ResponseBody = SendInventoryAlertData;
  }

  /**
   * @description Send an order status update notification to both customer and admin
   * @tags dbtn/module:notification
   * @name send_order_status_update
   * @summary Send Order Status Update
   * @request POST:/routes/send-order-status-update
   */
  export namespace send_order_status_update {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = OrderUpdate;
    export type RequestHeaders = {};
    export type ResponseBody = SendOrderStatusUpdateData;
  }

  /**
   * @description Send an order confirmation email to the customer
   * @tags dbtn/module:notification
   * @name send_order_confirmation_email
   * @summary Send Order Confirmation Email
   * @request POST:/routes/send-order-confirmation-email
   */
  export namespace send_order_confirmation_email {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = OrderConfirmationEmail;
    export type RequestHeaders = {};
    export type ResponseBody = SendOrderConfirmationEmailData;
  }

  /**
   * @description Create a new product
   * @tags dbtn/module:products
   * @name create_product
   * @summary Create Product
   * @request POST:/routes/products
   */
  export namespace create_product {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ProductCreate;
    export type RequestHeaders = {};
    export type ResponseBody = CreateProductData;
  }

  /**
   * @description Get all products with filtering, pagination and sorting
   * @tags dbtn/module:products
   * @name get_products
   * @summary Get Products
   * @request GET:/routes/products
   */
  export namespace get_products {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetProductsData;
  }

  /**
   * @description Get all product categories
   * @tags dbtn/module:products
   * @name get_categories
   * @summary Get Categories
   * @request GET:/routes/products/categories
   */
  export namespace get_categories {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetCategoriesData;
  }

  /**
   * @description Get featured products
   * @tags dbtn/module:products
   * @name get_featured_products
   * @summary Get Featured Products
   * @request GET:/routes/products/featured
   */
  export namespace get_featured_products {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Limit
       * @min 1
       * @max 20
       * @default 8
       */
      limit?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetFeaturedProductsData;
  }

  /**
   * @description Get a specific product by ID
   * @tags dbtn/module:products
   * @name get_product
   * @summary Get Product
   * @request GET:/routes/products/{product_id}
   */
  export namespace get_product {
    export type RequestParams = {
      /**
       * Product Id
       * The ID of the product to retrieve
       */
      productId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetProductData;
  }

  /**
   * @description Update a product
   * @tags dbtn/module:products
   * @name update_product
   * @summary Update Product
   * @request PUT:/routes/products/{product_id}
   */
  export namespace update_product {
    export type RequestParams = {
      /** Product Id */
      productId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = ProductUpdate;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateProductData;
  }

  /**
   * @description Delete a product
   * @tags dbtn/module:products
   * @name delete_product
   * @summary Delete Product
   * @request DELETE:/routes/products/{product_id}
   */
  export namespace delete_product {
    export type RequestParams = {
      /** Product Id */
      productId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteProductData;
  }

  /**
   * @description Create a new supplier account (admin only)
   * @tags dbtn/module:suppliers
   * @name create_supplier
   * @summary Create Supplier
   * @request POST:/routes/admin/suppliers
   */
  export namespace create_supplier {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = SupplierCreate;
    export type RequestHeaders = {};
    export type ResponseBody = CreateSupplierData;
  }

  /**
   * @description Get all suppliers with filtering and pagination (admin only)
   * @tags dbtn/module:suppliers
   * @name get_suppliers
   * @summary Get Suppliers
   * @request GET:/routes/admin/suppliers
   */
  export namespace get_suppliers {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSuppliersData;
  }

  /**
   * @description Get a specific supplier by ID (admin only)
   * @tags dbtn/module:suppliers
   * @name get_supplier
   * @summary Get Supplier
   * @request GET:/routes/admin/suppliers/{supplier_id}
   */
  export namespace get_supplier {
    export type RequestParams = {
      /**
       * Supplier Id
       * The ID of the supplier to retrieve
       */
      supplierId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSupplierData;
  }

  /**
   * @description Update a supplier (admin only)
   * @tags dbtn/module:suppliers
   * @name update_supplier
   * @summary Update Supplier
   * @request PUT:/routes/admin/suppliers/{supplier_id}
   */
  export namespace update_supplier {
    export type RequestParams = {
      /** Supplier Id */
      supplierId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = SupplierUpdate;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateSupplierData;
  }

  /**
   * @description Delete a supplier (admin only)
   * @tags dbtn/module:suppliers
   * @name delete_supplier
   * @summary Delete Supplier
   * @request DELETE:/routes/admin/suppliers/{supplier_id}
   */
  export namespace delete_supplier {
    export type RequestParams = {
      /** Supplier Id */
      supplierId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteSupplierData;
  }

  /**
   * @description Get products for a specific supplier (supplier dashboard)
   * @tags dbtn/module:suppliers
   * @name get_supplier_products
   * @summary Get Supplier Products
   * @request GET:/routes/suppliers/products
   */
  export namespace get_supplier_products {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Supplier Id */
      supplier_id: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSupplierProductsData;
  }

  /**
   * @description Get orders containing products from a specific supplier (supplier dashboard)
   * @tags dbtn/module:suppliers
   * @name get_supplier_orders
   * @summary Get Supplier Orders
   * @request GET:/routes/suppliers/orders
   */
  export namespace get_supplier_orders {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Supplier Id */
      supplier_id: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSupplierOrdersData;
  }

  /**
   * @description Register a new user
   * @tags dbtn/module:user_auth
   * @name register_user
   * @summary Register User
   * @request POST:/routes/register
   */
  export namespace register_user {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UserRegistration;
    export type RequestHeaders = {};
    export type ResponseBody = RegisterUserData;
  }

  /**
   * @description Login a user
   * @tags dbtn/module:user_auth
   * @name login_user
   * @summary Login User
   * @request POST:/routes/login
   */
  export namespace login_user {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UserLogin;
    export type RequestHeaders = {};
    export type ResponseBody = LoginUserData;
  }

  /**
   * @description Get user by email
   * @tags dbtn/module:user_auth
   * @name get_user
   * @summary Get User
   * @request POST:/routes/get-user
   */
  export namespace get_user {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = GetUserRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserData;
  }

  /**
   * @description Create a new address for a user
   * @tags dbtn/module:user_auth
   * @name create_address
   * @summary Create Address
   * @request POST:/routes/addresses/create
   */
  export namespace create_address {
    export type RequestParams = {};
    export type RequestQuery = {
      /** User Id */
      user_id: string;
    };
    export type RequestBody = AddressCreate;
    export type RequestHeaders = {};
    export type ResponseBody = CreateAddressData;
  }

  /**
   * @description Get all addresses for a user
   * @tags dbtn/module:user_auth
   * @name get_user_addresses
   * @summary Get User Addresses
   * @request GET:/routes/addresses/{user_id}
   */
  export namespace get_user_addresses {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserAddressesData;
  }

  /**
   * @description Migrate users from localStorage to backend storage
   * @tags dbtn/module:user_auth
   * @name migrate_local_users
   * @summary Migrate Local Users
   * @request POST:/routes/migrate-users
   */
  export namespace migrate_local_users {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = MigrateLocalUsersPayload;
    export type RequestHeaders = {};
    export type ResponseBody = MigrateLocalUsersData;
  }

  /**
   * @description Get a summary of orders by status
   * @tags dbtn/module:orders
   * @name get_order_summary
   * @summary Get Order Summary
   * @request GET:/routes/orders/summary
   */
  export namespace get_order_summary {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetOrderSummaryData;
  }

  /**
   * @description Create a new order
   * @tags dbtn/module:orders
   * @name create_order
   * @summary Create Order
   * @request POST:/routes/orders/create
   */
  export namespace create_order {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateOrderRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateOrderData;
  }

  /**
   * @description Get all orders with optional filtering and pagination
   * @tags dbtn/module:orders
   * @name get_all_orders
   * @summary Get All Orders
   * @request GET:/routes/orders/all
   */
  export namespace get_all_orders {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAllOrdersData;
  }

  /**
   * @description Get all orders for a specific user
   * @tags dbtn/module:orders
   * @name get_user_orders
   * @summary Get User Orders
   * @request GET:/routes/orders/user
   */
  export namespace get_user_orders {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserOrdersData;
  }

  /**
   * @description Get a specific order by ID
   * @tags dbtn/module:orders
   * @name get_order
   * @summary Get Order
   * @request GET:/routes/orders/{order_id}
   */
  export namespace get_order {
    export type RequestParams = {
      /**
       * Order Id
       * The ID of the order to retrieve
       */
      orderId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetOrderData;
  }

  /**
   * @description Update the status of an order
   * @tags dbtn/module:orders
   * @name update_order_status
   * @summary Update Order Status
   * @request PUT:/routes/orders/{order_id}/status
   */
  export namespace update_order_status {
    export type RequestParams = {
      /** Order Id */
      orderId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateOrderStatusRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateOrderStatusData;
  }

  /**
   * @description Get list of Ethiopian product categories
   * @tags dbtn/module:categories
   * @name get_ethiopian_categories
   * @summary Get Ethiopian Categories
   * @request GET:/routes/categories
   */
  export namespace get_ethiopian_categories {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetEthiopianCategoriesData;
  }
}
