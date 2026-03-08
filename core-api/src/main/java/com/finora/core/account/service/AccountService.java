package com.finora.core.account.service;

import com.finora.core.account.Account;
import com.finora.core.account.AccountRepository;
import com.finora.core.account.dto.AccountResponse;
import com.finora.core.account.dto.CreateAccountRequest;
import com.finora.core.common.exception.BusinessException;
import com.finora.core.user.User;
import com.finora.core.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    @Transactional
    public AccountResponse create(CreateAccountRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> BusinessException.notFound(
                        "USER_NOT_FOUND", "사용자를 찾을 수 없습니다."));

        Account account = new Account(
                user,
                request.getInstitution(),
                request.getAccountNoHash(),
                request.getCurrency(),
                request.getNickname()
        );
        accountRepository.save(account);
        return new AccountResponse(account);
    }

    public AccountResponse findById(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound(
                        "ACCOUNT_NOT_FOUND", "계좌를 찾을 수 없습니다."));
        return new AccountResponse(account);
    }
}
