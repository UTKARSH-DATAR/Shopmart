package backend.controller;

import backend.entity.CartItem;
import backend.entity.User;
import backend.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:4200")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping("/user/{userId}")
    public List<CartItem> getCartByUserId(@PathVariable Long userId) {
        return cartService.getCartByUserId(userId);
    }

    @PostMapping("/mycart")
    public List<CartItem> getCart(@RequestBody User user) {
        return cartService.getCartForUser(user);
    }

    @PostMapping("/add")
    public CartItem addToCart(@RequestBody CartItem item) {
        return cartService.addToCart(item);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateCartItemQuantity(@PathVariable Long id, @RequestParam Integer quantity) {
        try {
            CartItem updated = cartService.updateQuantity(id, quantity);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/remove/{id}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long id) {
        cartService.removeFromCart(id);
        return ResponseEntity.ok("Item removed");
    }

    @PostMapping("/clear")
    public ResponseEntity<?> clearCart(@RequestBody User user) {
        cartService.clearCart(user);
        return ResponseEntity.ok("Cart cleared");
    }

    @DeleteMapping("/clear/user/{userId}")
    public ResponseEntity<?> clearCartByUserId(@PathVariable Long userId) {
        cartService.clearCartByUserId(userId);
        return ResponseEntity.ok("Cart cleared");
    }
}
