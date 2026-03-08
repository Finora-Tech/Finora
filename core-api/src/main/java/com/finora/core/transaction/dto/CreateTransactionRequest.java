package com.finora.core.transaction.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class CreateTransactionRequest {

    @NotNull(message = "accountId는 필수입니다.")
    private Long accountId;

    @NotNull(message = "type은 필수입니다.")
    private String type;

    @NotNull(message = "amount는 필수입니다.")
    @DecimalMin(value = "0.0001", message = "금액은 0보다 커야 합니다.")
    private BigDecimal amount;

    private String currency;
    private String description;
    private String referenceNo;
}
