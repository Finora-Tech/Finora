# Finora — Claude Rules

## 프로젝트 개요

Finora: 실시간 금융 거래 모니터링 플랫폼
- Backend: Spring Boot 3.x (core-api)
- Frontend: Next.js (dashboard)
- 인프라: Kafka, PostgreSQL, Elasticsearch, Prometheus, Grafana

---

## 세부 규칙 파일

| 규칙 | 파일 |
|------|------|
| 세션 시작·종료 루틴 | `.claude/rules/session.md` |
| 백엔드 코드 작업 방식 | `.claude/rules/backend.md` |
| 인프라 작업 방식 | `.claude/rules/infra.md` |
| 실행 루프 · 역할 · 실패 대응 | `.claude/rules/loop.md` |

> 세션 시작 시 `session.md`를 반드시 읽는다.
> 백엔드/인프라 작업 시 해당 규칙 파일을 읽고 따른다.

---

## 작업 원칙

- **오늘 할 일 파일에 있는 것만** 수행한다. 욕심 부리지 않는다
- scope out에 명시된 작업은 요청해도 "다음 회차 범위입니다"라고 알린다
- 코드 변경 전 반드시 관련 파일을 읽는다
- 불필요한 파일 생성, 과도한 추상화, 미래 대비 코드 작성 금지
- 커밋은 사용자가 명시적으로 요청할 때만 수행한다

---

## 파일 네이밍 컨벤션

| 파일 | 형식 | 예시 |
|------|------|------|
| 주간 계획 | `todo/YYMMDD(월)ToYYMMDD(일).md` | `todo/260223To260301.md` |
| 일일 계획 | `todo/YYMMDD.md` | `todo/260223.md` |
| 블로그 초안 | `docs/blog/YYMMDD-{slug}.md` | `docs/blog/260223-erd-design.md` |

---

## 주요 경로

- 주간/일일 목표: `todo/`
- 설계 문서: `docs/`
- 백엔드: `core-api/`
- 프론트엔드: `dashboard/`
- Claude 규칙: `.claude/rules/`
