package com.tritux.vidsecure.controller;

import com.tritux.vidsecure.dto.AuthReqDTO;
import com.tritux.vidsecure.dto.AuthResDTO;
import com.tritux.vidsecure.dto.RegisterRequestDTO;
import com.tritux.vidsecure.service.AuthenticationService;
import io.jsonwebtoken.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    @Autowired
    private AuthenticationService service;

    @PostMapping("/register")
    public ResponseEntity<AuthResDTO> register(
            @RequestBody RegisterRequestDTO request
    ) throws IOException {
        return ResponseEntity.ok().body(service.register(request));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthResDTO> authenticate(
            @RequestBody AuthReqDTO request
    ) {
        return ResponseEntity.ok(service.authenticate(request));
    }
}
