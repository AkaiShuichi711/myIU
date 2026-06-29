package com.myiu.portal.security;

import com.myiu.portal.entity.LoginSession;
import com.myiu.portal.entity.User;
import com.myiu.portal.repository.UserRepository;
import com.myiu.portal.service.SessionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final SessionService sessionService;

    @Value("${FRONTEND_URL:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        if (email == null) email = oAuth2User.getAttribute("preferred_username");

        if (email == null) {
            response.sendRedirect(frontendUrl + "/sign-in?error=no_email");
            return;
        }

        Optional<User> userOpt = userRepository.findByEmail(email);

        // User must be pre-provisioned by admin via Excel upload
        if (userOpt.isEmpty()) {
            response.sendRedirect(frontendUrl + "/sign-in?error=not_provisioned");
            return;
        }

        User user = userOpt.get();

        // User must be active (not deleted/deactivated)
        if (!user.isActive()) {
            response.sendRedirect(frontendUrl + "/sign-in?error=account_inactive");
            return;
        }

        LoginSession session = sessionService.createSession(user, request);
        String jwt = jwtService.generateToken(user.getEmail(),
                Map.of("sessionId", session.getId().toString()));
        response.sendRedirect(frontendUrl + "/auth/callback?token=" + jwt);
    }
}
