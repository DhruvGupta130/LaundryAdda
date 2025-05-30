package com.trulydesignfirm.laundryadda.actions;

import com.trulydesignfirm.laundryadda.enums.OrderStatus;
import com.trulydesignfirm.laundryadda.enums.OrderType;
import com.trulydesignfirm.laundryadda.model.Address;
import com.trulydesignfirm.laundryadda.model.Customer;
import com.trulydesignfirm.laundryadda.model.LaundryShop;
import com.trulydesignfirm.laundryadda.model.Orders;
import com.trulydesignfirm.laundryadda.model.embedded.BookingSlot;
import com.trulydesignfirm.laundryadda.model.embedded.OrderItems;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class OrdersDTO {
    private UUID id;
    private List<OrderItems> items;
    private String notes;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private Address address;
    private BookingSlot pickupSlot;
    private LocalDate deliveryDate;
    private String instructions;
    private OrderType orderType;
    private Customer customer;
    private LaundryShop shop;

    public OrdersDTO(Orders order) {
        this.id = order.getId();
        this.items = order.getItems();
        this.notes = order.getNotes();
        this.status = order.getStatus();
        this.totalAmount = order.getTotalAmount();
        this.address = order.getAddress();
        this.pickupSlot = order.getPickupSlot();
        this.deliveryDate = order.getDeliveryDate();
        this.instructions = order.getInstructions();
        this.orderType = order.getOrderType();
        this.customer = order.getCustomer();
        this.shop = order.getShop();
    }
}