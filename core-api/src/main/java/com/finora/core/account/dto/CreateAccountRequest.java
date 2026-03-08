package com.finora.core.account.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class CreateAccountRequest {

    @NotNull(message = "userId는 필수입니다.")
    private Long userId;

    private String institution;
    private String accountNoHash;
    private String currency;
    private String nickname;
}
