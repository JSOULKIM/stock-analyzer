# 한국 주식 AI 분석기

종목명 입력 → AI가 실시간 웹 검색 후 단기 트레이딩 리포트 자동 생성

---

## 배포 방법 (코딩 몰라도 됩니다 — 복붙만)

### 1단계: GitHub에 업로드

1. https://github.com 접속 → 회원가입 (없으면)
2. 우측 상단 `+` 버튼 → `New repository`
3. Repository name: `stock-analyzer` 입력
4. `Create repository` 클릭
5. 이 폴더의 파일들을 모두 드래그 앤 드롭으로 업로드
   (`.env.local` 파일은 업로드하지 마세요!)

### 2단계: Vercel에 배포

1. https://vercel.com 접속 → GitHub 계정으로 로그인
2. `New Project` 클릭
3. 방금 만든 `stock-analyzer` 저장소 선택 → `Import`
4. **Environment Variables** 섹션에서:
   - Name: `ANTHROPIC_API_KEY`
   - Value: Anthropic API 키 붙여넣기
     (발급: https://console.anthropic.com → API Keys → Create Key)
5. `Deploy` 클릭
6. 1~2분 후 배포 완료 → URL 발급 (예: stock-analyzer-xxx.vercel.app)

### 3단계: 완료

발급된 URL로 접속하면 바로 사용 가능합니다.

---

## API 키 발급 방법

1. https://console.anthropic.com 접속
2. 회원가입 / 로그인
3. 좌측 메뉴 `API Keys` 클릭
4. `Create Key` → 키 복사
5. Vercel 환경 변수에 붙여넣기

---

## 기능

- 종목명 또는 종목코드 입력
- 투자 기간 / 분석 깊이 / 시드머니 옵션
- AI 실시간 웹 검색 기반 분석
- 1. 기업 개요 2. 경쟁력&리스크 3. 기술적분석 4. 매매전략 5. 수급분석 6. 핵심요약
- 최근 검색 종목 저장
- 리포트 복사 기능

---

## 주의사항

본 서비스는 AI가 공개 정보를 기반으로 생성한 참고 자료이며 투자 권유가 아닙니다.
투자 판단 및 책임은 본인에게 있습니다.
