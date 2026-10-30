package backend.service;

import backend.entity.CartItem;
import backend.entity.Product;
import backend.entity.User;
import backend.repository.CartItemRepository;
import backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<CartItem> getCartForUser(User user) {
        if (user != null && user.getId() != null) {
            return cartItemRepository.findByUserId(user.getId());
        }
        return cartItemRepository.findByUser(user);
    }

    public List<CartItem> getCartByUserId(Long userId) {
        return cartItemRepository.findByUserId(userId);
    }

    public CartItem addToCart(CartItem item) {
        if (item.getProduct() == null || item.getProduct().getId() == null) {
            throw new RuntimeException("Product is required to add to cart!");
        }

        Product product = productRepository.findById(item.getProduct().getId())
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + item.getProduct().getId()));

        int requestedQty = (item.getQuantity() != null && item.getQuantity() > 0) ? item.getQuantity() : 1;

        // Check if this item already exists in the user's cart
        Optional<CartItem> existingItem = Optional.empty();
        if (item.getUser() != null) {
            if (item.getUser().getId() != null) {
                existingItem = cartItemRepository.findByUserIdAndProductId(item.getUser().getId(), product.getId());
            } else {
                existingItem = cartItemRepository.findByUserAndProduct(item.getUser(), product);
            }
        }

        if (existingItem.isPresent()) {
            CartItem cartItem = existingItem.get();
            int newQuantity = cartItem.getQuantity() + requestedQty;

            // Check stock availability (matches Flopkart AvailableQuantity check)
            if (product.getStockQuantity() < newQuantity) {
                throw new RuntimeException("Only " + product.getStockQuantity() + " units available in stock for " + product.getName());
            }

            cartItem.setQuantity(newQuantity);
            return cartItemRepository.save(cartItem);
        }

        // Check stock availability for new item
        if (product.getStockQuantity() < requestedQty) {
            throw new RuntimeException("Only " + product.getStockQuantity() + " units available in stock for " + product.getName());
        }

        item.setProduct(product);
        item.setQuantity(requestedQty);
        return cartItemRepository.save(item);
    }

    public CartItem updateQuantity(Long cartItemId, Integer quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found with id: " + cartItemId));

        if (quantity == null || quantity <= 0) {
            cartItemRepository.delete(cartItem);
            return null;
        }

        // Validate stock availability
        if (cartItem.getProduct() != null && cartItem.getProduct().getStockQuantity() < quantity) {
            throw new RuntimeException("Only " + cartItem.getProduct().getStockQuantity() + " units available in stock!");
        }

        cartItem.setQuantity(quantity);
        return cartItemRepository.save(cartItem);
    }

    public void removeFromCart(Long cartItemId) {
        cartItemRepository.deleteById(cartItemId);
    }

    @Transactional
    public void clearCart(User user) {
        if (user != null && user.getId() != null) {
            cartItemRepository.deleteByUserId(user.getId());
        } else if (user != null) {
            List<CartItem> items = cartItemRepository.findByUser(user);
            cartItemRepository.deleteAll(items);
        }
    }

    @Transactional
    public void clearCartByUserId(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }
}
