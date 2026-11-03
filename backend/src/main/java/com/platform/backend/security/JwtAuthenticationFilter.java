package com.platform.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

// OncePerRequestFilter = runs once on every incoming request.
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);   // strip the "Bearer " prefix

            if (jwtService.isValid(token)) {
                String email = jwtService.extractEmail(token);
                String role  = jwtService.extractRole(token);

                // Spring's convention: roles are authorities prefixed "ROLE_".
                var authority = new SimpleGrantedAuthority("ROLE_" + role);
                var auth = new UsernamePasswordAuthenticationToken(
                        email, null, List.of(authority));

                // Tell Spring: THIS request is now authenticated as this user.
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        // Always continue the chain — if unauthenticated, the rules reject it later.
        filterChain.doFilter(request, response);
    }
}
