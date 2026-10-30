package backend.controller;

import backend.entity.Order;
import backend.entity.User;
import backend.service.OrderService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:4200")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/place")
    public ResponseEntity<?> placeOrder(@RequestBody Order order) {
        try {
            Order placedOrder = orderService.placeOrder(order);
            return ResponseEntity.ok(placedOrder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Allows the frontend to load user's past orders via GET /api/orders/user/1
    @GetMapping("/user/{userId}")
    public List<Order> getOrderHistoryByUserId(@PathVariable Long userId) {
        return orderService.getOrderHistoryByUserId(userId);
    }

    // Allows the frontend to load the user's past orders via POST
    // /api/orders/history
    @PostMapping("/history")
    public List<Order> getOrderHistory(@RequestBody User user) {
        return orderService.getOrderHistory(user);
    }

    // Load single order by ID for order confirmation / receipt page
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        try {
            Order order = orderService.getOrderById(id);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Admin: Get all orders
    @GetMapping
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    // Admin: Update order status (e.g. PROCESSING, SHIPPED, DELIVERED, CANCELLED)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            Order updated = orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
