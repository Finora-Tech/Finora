package com.finora.core.account;

import com.finora.core.common.BaseEntity;
import com.finora.core.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "accounts")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Account extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 100)
    private String institution;

    @Column(name = "account_no_hash")
    private String accountNoHash;

    @Column(length = 10)
    private String currency;

    @Column(length = 100)
    private String nickname;

    @Column(precision = 19, scale = 4)
    private BigDecimal balance;

    public Account(User user, String institution, String accountNoHash,
                   String currency, String nickname) {
        this.user = user;
        this.institution = institution;
        this.accountNoHash = accountNoHash;
        this.currency = currency != null ? currency : "KRW";
        this.nickname = nickname;
        this.balance = BigDecimal.ZERO;
    }

    public void updateBalance(BigDecimal amount) {
        this.balance = this.balance.add(amount);
    }
}
