package backend.service;

import backend.entity.Order;
import backend.entity.OrderItem;
import backend.entity.User;
import backend.entity.Product;
import backend.repository.CartItemRepository;
import backend.repository.OrderRepository;
import backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Transactional
    public Order placeOrder(Order order) {
        double calculatedTotal = 0.0;

        if (order.getItems() != null && !order.getItems().isEmpty()) {
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() == null || item.getProduct().getId() == null) {
                    throw new RuntimeException("Product details are required for each item!");
                }

                Product product = productRepository.findById(item.getProduct().getId())
                        .orElseThrow(() -> new RuntimeException("Product not found with id: " + item.getProduct().getId()));

                int requestedQty = item.getQuantity() != null ? item.getQuantity() : 1;
                item.setQuantity(requestedQty);

                // Stock validation
                if (product.getStockQuantity() < requestedQty) {
                    throw new RuntimeException("Insufficient stock for product: " + product.getName()
                            + " (Available: " + product.getStockQuantity() + ", Requested: " + requestedQty + ")");
                }

                // Decrement stock
                product.setStockQuantity(product.getStockQuantity() - requestedQty);
                productRepository.save(product);

                // Lock price to actual product price from database
                item.setPrice(product.getPrice());
                item.setProduct(product);
                item.setOrder(order);

                calculatedTotal += product.getPrice() * requestedQty;
            }
        }

        order.setTotalAmount(calculatedTotal);
        order.setStatus("Placed");
        if (order.getOrderDate() == null) {
            order.setOrderDate(LocalDateTime.now());
        }
        if (order.getOrderNumber() == null || order.getOrderNumber().trim().isEmpty()) {
            long count = orderRepository.count();
            order.setOrderNumber(String.format("SHPMRT%06d", count + 1));
        }

        Order savedOrder = orderRepository.save(order);

        // Clear user's cart upon successful order
        if (order.getUser() != null && order.getUser().getId() != null) {
            try {
                cartItemRepository.deleteByUserId(order.getUser().getId());
            } catch (Exception e) {
                // If cart is already empty or user not in cart, continue
            }
        }

        return savedOrder;
    }

    public List<Order> getOrderHistory(User user) {
        if (user != null && user.getId() != null) {
            return orderRepository.findByUserIdOrderByOrderDateDesc(user.getId());
        }
        return orderRepository.findByUser(user);
    }

    public List<Order> getOrderHistoryByUserId(Long userId) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId);
    }

    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String status) {
        Order order = getOrderById(orderId);

        // If order is cancelled, restock product inventory (matches Flopkart restockCancelledOrder)
        if ("Cancelled".equalsIgnoreCase(status) && !"Cancelled".equalsIgnoreCase(order.getStatus())) {
            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    if (item.getProduct() != null && item.getProduct().getId() != null) {
                        Product product = productRepository.findById(item.getProduct().getId()).orElse(null);
                        if (product != null) {
                            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                            productRepository.save(product);
                        }
                    }
                }
            }
        }

        order.setStatus(status);
        return orderRepository.save(order);
    }
}
