package backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

/**
 * Configuration to forward frontend routes to index.html for Single-Page Application (SPA) routing,
 * while allowing /api/** endpoints to be processed normally by Spring Boot RestControllers.
 */
@Configuration
public class SpaWebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requestedResource = location.createRelative(resourcePath);

                        // If the static file exists (e.g. .js, .css, .ico, images), serve it directly
                        if (requestedResource.exists() && requestedResource.isReadable()) {
                            return requestedResource;
                        }

                        // Don't forward /api calls to index.html (let RestControllers handle them)
                        if (resourcePath.startsWith("api") || resourcePath.startsWith("/api")) {
                            return null;
                        }

                        // Otherwise forward client-side route requests (e.g. /cart, /admin, /orders) to index.html
                        Resource index = location.createRelative("index.html");
                        return index.exists() && index.isReadable() ? index : null;
                    }
                });
    }
}

