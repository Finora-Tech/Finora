package com.finora.core.account.dto;

import com.finora.core.account.Account;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
public class AccountResponse {

    private final Long id;
    private final Long userId;
    private final String institution;
    private final String currency;
    private final String nickname;
    private final BigDecimal balance;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public AccountResponse(Account account) {
        this.id = account.getId();
        this.userId = account.getUser().getId();
        this.institution = account.getInstitution();
        this.currency = account.getCurrency();
        this.nickname = account.getNickname();
        this.balance = account.getBalance();
        this.createdAt = account.getCreatedAt();
        this.updatedAt = account.getUpdatedAt();
    }
}
