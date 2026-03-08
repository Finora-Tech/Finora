package com.finora.core.transaction.service;

import com.finora.core.account.Account;
import com.finora.core.account.AccountRepository;
import com.finora.core.common.exception.BusinessException;
import com.finora.core.transaction.*;
import com.finora.core.transaction.dto.CreateTransactionRequest;
import com.finora.core.transaction.dto.TransactionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    @Transactional
    public TransactionResponse create(CreateTransactionRequest request) {
        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> BusinessException.notFound(
                        "ACCOUNT_NOT_FOUND", "계좌를 찾을 수 없습니다."));

        TransactionType type = parseType(request.getType());

        Transaction tx = new Transaction(
                account, type, request.getAmount(),
                request.getCurrency(), request.getDescription(),
                request.getReferenceNo()
        );
        transactionRepository.save(tx);

        // 잔액 업데이트
        BigDecimal balanceChange = (type == TransactionType.WITHDRAWAL)
                ? request.getAmount().negate()
                : request.getAmount();
        account.updateBalance(balanceChange);

        return new TransactionResponse(tx);
    }

    public TransactionResponse findById(Long id) {
        Transaction tx = transactionRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound(
                        "TRANSACTION_NOT_FOUND", "거래를 찾을 수 없습니다."));
        return new TransactionResponse(tx);
    }

    public Page<TransactionResponse> findByAccountId(Long accountId, String type,
                                                      String status, Pageable pageable) {
        Page<Transaction> page;

        if (type != null && status != null) {
            page = transactionRepository.findByAccountIdAndTypeAndStatus(
                    accountId, TransactionType.valueOf(type),
                    TransactionStatus.valueOf(status), pageable);
        } else if (type != null) {
            page = transactionRepository.findByAccountIdAndType(
                    accountId, TransactionType.valueOf(type), pageable);
        } else if (status != null) {
            page = transactionRepository.findByAccountIdAndStatus(
                    accountId, TransactionStatus.valueOf(status), pageable);
        } else {
            page = transactionRepository.findByAccountId(accountId, pageable);
        }

        return page.map(TransactionResponse::new);
    }

    private TransactionType parseType(String type) {
        try {
            return TransactionType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw BusinessException.badRequest(
                    "INVALID_TRANSACTION_TYPE", "유효하지 않은 거래 유형입니다: " + type);
        }
    }
}
