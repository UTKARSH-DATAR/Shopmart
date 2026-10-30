package backend.service;

import backend.entity.Product;
import backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    // Get all active products to show on the Home Page (matches Flopkart where status='Active')
    public List<Product> getAllProducts() {
        return productRepository.findByStatus("Active");
    }

    // Admin: Get all products including deleted
    public List<Product> getAllProductsAdmin() {
        return productRepository.findAll();
    }

    // Get a single product for the Product Details page
    public Product getProductById(Long id) {
        Optional<Product> product = productRepository.findById(id);
        if (product.isPresent()) {
            return product.get();
        } else {
            throw new RuntimeException("Product not found!");
        }
    }

    // For the Admin to add new products
    public Product addProduct(Product product) {
        if (product.getStatus() == null || product.getStatus().trim().isEmpty()) {
            product.setStatus("Active");
        }
        return productRepository.save(product);
    }

    // For the Admin to update existing products
    public Product updateProduct(Long id, Product productDetails) {
        Product product = getProductById(id);
        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setStockQuantity(productDetails.getStockQuantity());
        product.setImageUrl(productDetails.getImageUrl());
        product.setCategory(productDetails.getCategory());
        if (productDetails.getStatus() != null && !productDetails.getStatus().trim().isEmpty()) {
            product.setStatus(productDetails.getStatus());
        }
        return productRepository.save(product);
    }

    // Soft delete product (matches Flopkart: update products set status='Deleted', quantity=0)
    // This preserves historical records in past customer orders without FK constraint errors!
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        product.setStatus("Deleted");
        product.setStockQuantity(0);
        productRepository.save(product);
    }

    // Search active products by name keyword
    public List<Product> searchProducts(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllProducts();
        }
        return productRepository.findByStatusAndNameContainingIgnoreCase("Active", query.trim());
    }

    // Filter active products by category
    public List<Product> getProductsByCategory(String category) {
        if (category == null || category.trim().isEmpty()) {
            return getAllProducts();
        }
        return productRepository.findByStatusAndCategoryIgnoreCase("Active", category.trim());
    }
}
