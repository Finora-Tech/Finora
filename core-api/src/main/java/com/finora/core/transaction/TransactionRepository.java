package com.finora.core.transaction;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Page<Transaction> findByAccountId(Long accountId, Pageable pageable);

    Page<Transaction> findByAccountIdAndType(Long accountId, TransactionType type, Pageable pageable);

    Page<Transaction> findByAccountIdAndStatus(Long accountId, TransactionStatus status, Pageable pageable);

    Page<Transaction> findByAccountIdAndTypeAndStatus(Long accountId, TransactionType type,
                                                       TransactionStatus status, Pageable pageable);
}
