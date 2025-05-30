export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
export const WEBSOCKET_URL = `${BACKEND_URL}/ws`;
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
export const UPLOAD_URL = `${BACKEND_URL}/api/files/upload-image`;

//Authentication Routes
export const LOGIN_URL = `${BACKEND_URL}/api/auth/login`;
export const FORGOT_PASSWORD_URL = `${BACKEND_URL}/api/auth/forgot-password`;
export const VERIFY_TOKEN_URL = `${BACKEND_URL}/api/auth/verify-token`;
export const RESET_PASSWORD_URL =`${BACKEND_URL}/api/auth/reset-password`;
export const OAUTH_URL = `${BACKEND_URL}/oauth2/authorization/google`;
export const GET_OTP = `${BACKEND_URL}/api/auth/get-otp`;
export const REGISTER_URL = `${BACKEND_URL}/api/auth/register`;

//User Routes
export const FETCH_USER_PROFILE = `${BACKEND_URL}/api/user/profile`;

//public Routes
export const FETCH_TIME_SLOTS = `${BACKEND_URL}/api/public/timeslots`;
export const FETCH_AREAS = (pageNumber, size, city) => `${BACKEND_URL}/api/public/areas?pageNumber=${pageNumber}&size=${size}&city=${city}`;
export const FETCH_NEARBY_SHOPS = (latitude, longitude, radius) => `${BACKEND_URL}/api/public/shops?latitude=${latitude}&longitude=${longitude}&radius=${radius}`;
export const FETCH_LAUNDRY_PRICING = (shopId) => `${BACKEND_URL}/api/public/laundry/pricing/${shopId}`;
export const FETCH_SHOP_RATING = (shopId) => `${BACKEND_URL}/api/public/shop/rating/${shopId}`;
export const FETCH_SHOP_REVIEWS = (shopId) => `${BACKEND_URL}/api/public/shop/reviews/${shopId}`;

//Laundry Routes
export const VALIDATE_LAUNDRY_PROFILE = `${BACKEND_URL}/api/laundry/validate`;
export const FETCH_LAUNDRY = `${BACKEND_URL}/api/laundry/get`;
export const CREATE_LAUNDRY = `${BACKEND_URL}/api/laundry/create`;
export const LAUNDRY_KYC = `${BACKEND_URL}/api/laundry/kyc`;
export const PRICING = `${BACKEND_URL}/api/laundry/pricing`;
export const UPLOAD_PRICING = `${BACKEND_URL}/api/laundry/pricing/upload`;
export const PICKUP_DELIVERY = `${BACKEND_URL}/api/laundry/delivery-pickup`;
export const FETCH_ORDERS = (pageNumber, size, status, query) => `${BACKEND_URL}/api/laundry/orders?pageNumber=${pageNumber}&size=${size}&status=${status}&query=${query}`;
export const ACCEPT_ORDER = (orderId) => `${BACKEND_URL}/api/laundry/order/accept/${orderId}`;
export const GENERATE_BILL = (orderId, notes) => `${BACKEND_URL}/api/laundry/order/bill/${orderId}?notes=${notes}`;
export const PROCESS_ORDER = (orderId) => `${BACKEND_URL}/api/laundry/order/process/${orderId}`;
export const READY_ORDER_FOR_DELIVERY = (orderId) => `${BACKEND_URL}/api/laundry/order/ready/${orderId}`;
export const CANCEL_ORDER = (orderId) => `${BACKEND_URL}/api/laundry/order/cancel/${orderId}`;
export const FETCH_SERVICES = `${BACKEND_URL}/api/laundry/pricing`;
export const FETCH_NEW_ORDERS = `${BACKEND_URL}/api/laundry/orders/new`;
export const GET_DASHBOARD_DATA = `${BACKEND_URL}/api/laundry/dashboard`;


//Delivery Routes
export const VALIDATE_DELIVERY_PROFILE = `${BACKEND_URL}/api/delivery/validate`;
export const UPDATE_DELIVERY_PROFILE = `${BACKEND_URL}/api/delivery/profile`;
export const FETCH_DELIVERY_PROFILE = `${BACKEND_URL}/api/delivery/profile`;
export const FETCH_DASHBOARD_DATA = `${BACKEND_URL}/api/delivery/dashboard`;
export const FETCH_DELIVERY_AREAS = `${BACKEND_URL}/api/delivery/areas`;
export const FETCH_CUSTOMER_PICKUPS = `${BACKEND_URL}/api/delivery/customer/pickups`;
export const UPDATE_CUSTOMER_PICKUP = (orderId, secret) => `${BACKEND_URL}/api/delivery/customer/pickup/${orderId}?secret=${secret}`;
export const FETCH_SHOP_DELIVERIES = `${BACKEND_URL}/api/delivery/shop/deliveries`;
export const UPDATE_SHOP_DELIVERY = (orderId) => `${BACKEND_URL}/api/delivery/shop/delivery/${orderId}`;
export const FETCH_SHOP_PICKUPS = `${BACKEND_URL}/api/delivery/shop/pickups`;
export const UPDATE_SHOP_PICKUP = (orderId) => `${BACKEND_URL}/api/delivery/shop/pickup/${orderId}`;
export const FETCH_CUSTOMER_DELIVERIES = `${BACKEND_URL}/api/delivery/customer/deliveries`;
export const UPDATE_CUSTOMER_DELIVERY = (orderId, secret) => `${BACKEND_URL}/api/delivery/customer/delivery/${orderId}?secret=${secret}`;

//Customer Routes
export const VALIDATE_CUSTOMER_PROFILE = `${BACKEND_URL}/api/customer/validate`;
export const UPDATE_CUSTOMER_PROFILE = `${BACKEND_URL}/api/customer/profile`;
export const FETCH_CUSTOMER_PROFILE = `${BACKEND_URL}/api/customer/profile`;
export const FETCH_CUSTOMER_ORDERS = (pageNumber, size) => `${BACKEND_URL}/api/customer/orders?pageNumber=${pageNumber}&size=${size}`;
export const CANCEL_PICKUP_REQUEST = (orderId) => `${BACKEND_URL}/api/customer/pickup/${orderId}`;
export const FETCH_SECRET_CODE = (orderId) => `${BACKEND_URL}/api/customer/order/secret/${orderId}`;
export const GET_ORDER_INVOICE = (orderId) => `${BACKEND_URL}/api/customer/order/invoice/${orderId}`;
export const UPDATE_SERVICE_REVIEW = (orderId) => `${BACKEND_URL}/api/customer/review/${orderId}`;
export const FETCH_ORDER_REVIEW = (orderId) => `${BACKEND_URL}/api/customer/review/${orderId}`;
export const FETCH_ADDRESSES = `${BACKEND_URL}/api/customer/addresses`;
export const ADD_ADDRESS = `${BACKEND_URL}/api/customer/address/add`;
export const DELETE_ADDRESS = (addressId) => `${BACKEND_URL}/api/customer/address/remove/${addressId}`;
export const REQUEST_PICKUP = `${BACKEND_URL}/api/customer/pickup`;