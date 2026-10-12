package com.donatenow.server.contact;

import com.donatenow.server.common.ClientIp;
import com.donatenow.server.common.RateLimitExceededException;
import com.donatenow.server.common.RateLimiter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactMessageRepository repository;
    private final RateLimiter rateLimiter = new RateLimiter(5, Duration.ofMinutes(15));

    public ContactController(ContactMessageRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<Map<String, Boolean>> submit(@Valid @RequestBody ContactRequest request, HttpServletRequest httpRequest) {
        if (!rateLimiter.tryAcquire(ClientIp.resolve(httpRequest))) {
            throw new RateLimitExceededException("Too many messages sent. Please try again later.");
        }

        ContactMessage message = new ContactMessage(
                request.name().trim(),
                request.email().trim(),
                request.message().trim(),
                request.newsletter()
        );
        repository.save(message);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("ok", true));
    }
}
