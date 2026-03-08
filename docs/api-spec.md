# Finora API 스펙 초안

> 최초 작성: 2026-02-23
> 범위: Core API — Account / Transaction CRUD
> Base URL: `http://localhost:8080`

---

## 공통

### 응답 형식

모든 응답은 아래 공통 래퍼를 사용한다.

**성공**
```json
{
  "success": true,
  "data": { ... }
}
```

**실패**
```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_NOT_FOUND",
    "message": "계좌를 찾을 수 없습니다."
  }
}
```

### HTTP 상태 코드

| 상황 | 코드 |
|------|------|
| 조회 성공 | 200 OK |
| 생성 성공 | 201 Created |
| 요청 오류 (유효성 실패 등) | 400 Bad Request |
| 리소스 없음 | 404 Not Found |
| 서버 오류 | 500 Internal Server Error |

---

## Account API

### POST /accounts — 계좌 생성

**Request**
```json
{
  "userId": 1,
  "institution": "KB",
  "accountNoHash": "a3f9c...",
  "currency": "KRW",
  "nickname": "주거래 통장"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| userId | Long | Y | 소유자 ID |
| institution | String | N | 금융 기관명 |
| accountNoHash | String | N | 계좌번호 해시값 |
| currency | String | N | 통화 코드 (기본값: KRW) |
| nickname | String | N | 계좌 별명 |

**Response** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "institution": "KB",
    "currency": "KRW",
    "nickname": "주거래 통장",
    "balance": 0,
    "createdAt": "2026-02-23T10:00:00"
  }
}
```

---

### GET /accounts/{id} — 계좌 단건 조회

**Path Variable**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| id | Long | 계좌 ID |

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "institution": "KB",
    "currency": "KRW",
    "nickname": "주거래 통장",
    "balance": 150000.0000,
    "createdAt": "2026-02-23T10:00:00",
    "updatedAt": "2026-02-23T12:00:00"
  }
}
```

**Error** `404 Not Found`
```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_NOT_FOUND",
    "message": "계좌를 찾을 수 없습니다."
  }
}
```

---

## Transaction API

### POST /transactions — 거래 생성

**Request**
```json
{
  "accountId": 1,
  "type": "DEPOSIT",
  "amount": 50000,
  "currency": "KRW",
  "description": "월급",
  "referenceNo": "REF-20260223-001"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| accountId | Long | Y | 대상 계좌 ID |
| type | String | Y | `DEPOSIT` / `WITHDRAWAL` / `TRANSFER` |
| amount | Decimal | Y | 거래 금액 (양수) |
| currency | String | N | 통화 코드 (기본값: 계좌 통화) |
| description | String | N | 거래 설명 |
| referenceNo | String | N | 외부 참조번호 |

**Response** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 10,
    "accountId": 1,
    "type": "DEPOSIT",
    "amount": 50000.0000,
    "currency": "KRW",
    "description": "월급",
    "status": "SUCCESS",
    "referenceNo": "REF-20260223-001",
    "createdAt": "2026-02-23T10:30:00"
  }
}
```

---

### GET /transactions/{id} — 거래 단건 조회

**Path Variable**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| id | Long | 거래 ID |

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 10,
    "accountId": 1,
    "type": "DEPOSIT",
    "amount": 50000.0000,
    "currency": "KRW",
    "description": "월급",
    "status": "SUCCESS",
    "referenceNo": "REF-20260223-001",
    "createdAt": "2026-02-23T10:30:00"
  }
}
```

---

### GET /accounts/{id}/transactions — 계좌별 거래 목록 조회

**Path Variable**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| id | Long | 계좌 ID |

**Query Parameter**

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| page | int | 0 | 페이지 번호 (0-based) |
| size | int | 20 | 페이지 크기 |
| type | String | (전체) | 거래 유형 필터 |
| status | String | (전체) | 처리 상태 필터 |

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 10,
        "type": "DEPOSIT",
        "amount": 50000.0000,
        "currency": "KRW",
        "description": "월급",
        "status": "SUCCESS",
        "createdAt": "2026-02-23T10:30:00"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

---

## 에러 코드 목록

| 코드 | HTTP | 설명 |
|------|------|------|
| `ACCOUNT_NOT_FOUND` | 404 | 계좌 없음 |
| `TRANSACTION_NOT_FOUND` | 404 | 거래 없음 |
| `USER_NOT_FOUND` | 404 | 사용자 없음 |
| `INVALID_AMOUNT` | 400 | 금액이 0 이하 |
| `INVALID_TRANSACTION_TYPE` | 400 | 유효하지 않은 거래 유형 |
| `INTERNAL_SERVER_ERROR` | 500 | 서버 내부 오류 |

---

## 미포함 (다음 회차 이후)

- `GET /accounts` — 사용자별 계좌 목록 (`GET /users/{id}/accounts`)
- `DELETE /accounts/{id}` — 계좌 비활성화
- Kafka 이벤트 발행 흐름
- Elasticsearch 검색 API (`/search/transactions`)
