package com.SignupForm.dto.auth;

import com.SignupForm.enums.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    private String name;
    private String email;
    private String password;
    private String phone;
    private Role role;
}
