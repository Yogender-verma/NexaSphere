package org.nexasphere.config;
import org.springframework.context.annotation.*;
import org.springframework.web.servlet.config.annotation.*;
@Configuration
public class CorsConfig implements WebMvcConfigurer { @Override public void addCorsMappings(CorsRegistry registry){ registry.addMapping("/**").allowedOrigins("*").allowedMethods("*"); } }
