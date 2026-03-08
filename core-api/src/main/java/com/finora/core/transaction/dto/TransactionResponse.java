package com.finora.core.transaction.dto;

import com.finora.core.transaction.Transaction;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
public class TransactionResponse {

    private final Long id;
    private final Long accountId;
    private final String type;
    private final BigDecimal amount;
    private final String currency;
    private final String description;
    private final String status;
    private final String referenceNo;
    private final LocalDateTime createdAt;

    public TransactionResponse(Transaction tx) {
        this.id = tx.getId();
        this.accountId = tx.getAccount().getId();
        this.type = tx.getType().name();
        this.amount = tx.getAmount();
        this.currency = tx.getCurrency();
        this.description = tx.getDescription();
        this.status = tx.getStatus().name();
        this.referenceNo = tx.getReferenceNo();
        this.createdAt = tx.getCreatedAt();
    }
}
