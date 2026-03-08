package com.finora.core.account.controller;

import com.finora.core.account.dto.AccountResponse;
import com.finora.core.account.dto.CreateAccountRequest;
import com.finora.core.account.service.AccountService;
import com.finora.core.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AccountResponse> create(@Valid @RequestBody CreateAccountRequest request) {
        return ApiResponse.ok(accountService.create(request));
    }

    @GetMapping("/{id}")
    public ApiResponse<AccountResponse> findById(@PathVariable Long id) {
        return ApiResponse.ok(accountService.findById(id));
    }
}
