package backend.service;

import backend.entity.User;
import backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // --- Business Logic for Registering ---
    public User registerUser(User user) {
        // Check if username already exists
        if (user.getUsername() != null && userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Username '" + user.getUsername() + "' is already taken!");
        }

        // Check if email already exists (if provided)
        if (user.getEmail() != null && !user.getEmail().trim().isEmpty()) {
            Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
            if (existingUser.isPresent()) {
                throw new RuntimeException("Email is already registered!");
            }
        }

        // Check for admin role (matches Flopkart admin username "utkarsh_datar" or explicit role)
        if ("utkarsh_datar".equalsIgnoreCase(user.getUsername())) {
            user.setRole("ADMIN");
        } else if (user.getRole() == null || user.getRole().trim().isEmpty()) {
            user.setRole("USER");
        }

        return userRepository.save(user);
    }

    // --- Business Logic for Logging In (Supports both username or email) ---
    public User loginUser(String identifier, String password) {
        // Try login by username first (as in Flopkart)
        Optional<User> userOpt = userRepository.findByUsernameAndPassword(identifier, password);

        // If not found, try by email
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmailAndPassword(identifier, password);
        }

        if (userOpt.isPresent()) {
            return userOpt.get();
        } else {
            throw new RuntimeException("Invalid username/email or password!");
        }
    }

    // --- Admin: Get all users (matches ViewUsers servlet in Flopkart) ---
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }
}
