package com.trulydesignfirm.laundryadda.enums;

public enum OrderStatus {
    PENDING_OWNER_CONFIRMATION,
    AWAITING_PICKUP,
    PICKED_UP,
    COUNTING,
    BILL_GENERATED,
    PROCESSING,
    READY_FOR_DELIVERY,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED_BY_CUSTOMER,
    CANCELLED_BY_ADMIN,
    CANCELLED_BY_OWNER
}
