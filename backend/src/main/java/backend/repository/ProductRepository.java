package backend.repository;

import backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByStatus(String status);
    List<Product> findByStatusAndNameContainingIgnoreCase(String status, String name);
    List<Product> findByStatusAndCategoryIgnoreCase(String status, String category);
    List<Product> findByNameContainingIgnoreCase(String name);
    List<Product> findByCategoryIgnoreCase(String category);
    List<Product> findByNameContainingIgnoreCaseAndCategoryIgnoreCase(String name, String category);
}
