package backend.repository;

import backend.entity.Order;
import backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // This allows us to fetch order history for a specific user
    List<Order> findByUser(User user);
    List<Order> findByUserId(Long userId);
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);
}
