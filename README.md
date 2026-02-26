# dayne-fe

Next.js frontend for the Dayne debt tracker.

## Features
- Create new loan tracker and generate links.
- Private borrower dashboard at `/manage/[manageToken]`.
- Public lender review page at `/loan/[publicToken]`.
- Archived read-only page at `/loan/archive/[archivedToken]`.
- Payment recording with optional proof upload (R2 presigned URL flow).
- Approve/reject workflow and live balance/progress updates.
- Immutable audit timeline on all views.

## Run locally
1. Copy env file:
```bash
cp .env.example .env.local
```
2. Set API URL:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```
3. Install dependencies and run:
```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:3000` by default.
