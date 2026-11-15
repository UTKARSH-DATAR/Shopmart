package backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
	public CommandLineRunner databaseMigrator(JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				jdbcTemplate.execute("ALTER TABLE products MODIFY COLUMN description TEXT");
				System.out.println("Database migration: products.description column updated to TEXT.");
			} catch (Exception e) {
				System.out.println("Database migration info: " + e.getMessage());
			}

			try {
				jdbcTemplate.execute("ALTER TABLE products MODIFY COLUMN image_url TEXT");
				System.out.println("Database migration: products.image_url column updated to TEXT.");
			} catch (Exception e) {
				System.out.println("Database migration info: " + e.getMessage());
			}
		};
	}
}
