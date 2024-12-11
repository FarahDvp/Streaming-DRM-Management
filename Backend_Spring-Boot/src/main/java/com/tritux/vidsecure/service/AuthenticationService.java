package com.tritux.vidsecure.service;

import com.tritux.vidsecure.dto.AuthReqDTO;
import com.tritux.vidsecure.dto.AuthResDTO;
import com.tritux.vidsecure.dto.RegisterRequestDTO;

public interface AuthenticationService {
    AuthResDTO register(RegisterRequestDTO request);
    AuthResDTO authenticate(AuthReqDTO request);
}
