package com.finora.core.transaction.controller;

import com.finora.core.common.dto.ApiResponse;
import com.finora.core.transaction.dto.CreateTransactionRequest;
import com.finora.core.transaction.dto.TransactionResponse;
import com.finora.core.transaction.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/transactions")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TransactionResponse> create(
            @Valid @RequestBody CreateTransactionRequest request) {
        return ApiResponse.ok(transactionService.create(request));
    }

    @GetMapping("/transactions/{id}")
    public ApiResponse<TransactionResponse> findById(@PathVariable Long id) {
        return ApiResponse.ok(transactionService.findById(id));
    }

    @GetMapping("/accounts/{accountId}/transactions")
    public ApiResponse<Page<TransactionResponse>> findByAccountId(
            @PathVariable Long accountId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.ok(transactionService.findByAccountId(accountId, type, status, pageable));
    }
}
