-- V1: 초기 스키마 생성 (users, accounts, transactions)

CREATE TABLE users (
    id          BIGSERIAL       PRIMARY KEY,
    email       VARCHAR(255)    NOT NULL UNIQUE,
    name        VARCHAR(100)    NOT NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE TABLE accounts (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL REFERENCES users(id),
    institution     VARCHAR(100),
    account_no_hash VARCHAR(255),
    currency        VARCHAR(10),
    nickname        VARCHAR(100),
    balance         DECIMAL(19,4)   DEFAULT 0,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);

CREATE TABLE transactions (
    id              BIGSERIAL       PRIMARY KEY,
    account_id      BIGINT          NOT NULL REFERENCES accounts(id),
    type            VARCHAR(20)     NOT NULL,
    amount          DECIMAL(19,4)   NOT NULL,
    currency        VARCHAR(10),
    description     VARCHAR(255),
    status          VARCHAR(20)     NOT NULL,
    reference_no    VARCHAR(100),
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_account_id ON transactions(account_id);
