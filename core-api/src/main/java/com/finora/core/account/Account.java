package com.finora.core.account;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity @Table(name = "accounts")
@Getter
@Setter
public class Account {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long accountId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    private String institution;
    private String accountNoHash;
    private String currency;
    private String nickname;
}
