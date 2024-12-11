package com.tritux.vidsecure.service.impl;

import com.tritux.vidsecure.config.JwtService;
import com.tritux.vidsecure.dto.AuthReqDTO;
import com.tritux.vidsecure.dto.AuthResDTO;
import com.tritux.vidsecure.dto.MemberDTO;
import com.tritux.vidsecure.dto.RegisterRequestDTO;
import com.tritux.vidsecure.mapper.MemberMapper;
import com.tritux.vidsecure.model.Member;
import com.tritux.vidsecure.repository.MemberRepository;
import com.tritux.vidsecure.service.AuthenticationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthenticationServiceImpl implements AuthenticationService {
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private MemberRepository repository;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private final AuthenticationManager authenticationManager;
    @Autowired
    private MemberMapper memberMapper;
    @Autowired
    private MemberDTO memberDTO;
    @Autowired
    private RabbitTemplate rabbitTemplate;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    private static final Logger logger = LoggerFactory.getLogger(AuthenticationServiceImpl.class);

    public AuthenticationServiceImpl(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    @Override
    public AuthResDTO register(RegisterRequestDTO request) {
        try {
            String uid = UUID.randomUUID().toString();
            while (repository.findByUid(uid).isPresent()) {
                uid = UUID.randomUUID().toString();
            }
            Member member = memberMapper.toEntity(memberDTO);
            member.setUid(uid);
            logger.info(uid);
            member.setUsername(request.getUsername());
            member.setFullname(request.getFullname());
            member.setEmail(request.getEmail());
            member.setPassword(passwordEncoder.encode(request.getPassword()));
            member.setPhone(request.getPhone());
            member.setCreationDate(LocalDateTime.now());
            member.setBlocked(false);
            member.setRole(request.getRole());
            Member savedMember = repository.save(member);

            String jwtToken = jwtService.generateToken(savedMember);

            String message = "Your account has started its payment.";
            rabbitTemplate.convertAndSend("paymentNotificationQueue", message);

            return AuthResDTO.builder()
                    .msg("User created successfully")
                    .accessToken(jwtToken)
                    .build();
        } catch (Exception e) {
            return AuthResDTO.builder()
                    .msg("User creation failed")
                    .build();
        }
    }

    @Override
    public AuthResDTO authenticate(AuthReqDTO request) {

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword())
            );
        } catch (BadCredentialsException e) {
            return AuthResDTO.builder()
                    .msg("Invalid username or password")
                    .build();
        } catch (Exception e) {
            return AuthResDTO.builder()
                    .msg("Authentication failed")
                    .build();
        }

        var user = repository.findByUsername(request.getUsername())
                .orElseThrow();

        if (user.getBlocked()) {
            messagingTemplate.convertAndSend("/topic/user-blocked", user.getUsername());
            return AuthResDTO.builder()
                    .msg("User is blocked")
                    .build();
        }

        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);

        return AuthResDTO.builder()
                .msg("Login successfully")
                .accessToken(jwtToken)
                .build();
    }

}
