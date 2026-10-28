# ScholarSpark AI - Deployment & Operations Guide

## 1. Overview & Architecture

ScholarSpark AI is a full-stack educational web application built for students sitting:
1. **ECZ (Examinations Council of Zambia)**: Grades 7, 9, 12, and GCE.
2. **Cambridge Assessment International Education**: IGCSE (Core & Extended), O-Level, and AS/A-Level.

The application combines a high-performance **Vite + React 19** frontend with an **Express Node.js** backend running `@google/genai` (Gemini 3.8 Flash model) for server-side pedagogical reasoning, structured question marking, multimodal homework OCR, and spaced repetition flashcard generation.

---

## 2. Local & Production Scripts

| Command | Action | Runtime Context |
|---|---|---|
| `npm run dev` | Starts full-stack Express server with Vite middleware on port 3000 | Development |
| `npm run lint` | Runs TypeScript compiler checks without emitting files (`tsc --noEmit`) | CI / Pre-commit |
| `npm run build` | Compiles production assets into `dist/` | Production Build |
| `npm run start` | Boots the full-stack server serving production static assets from `dist/` | Cloud Run / Production |

---

## 3. GitHub Source Control Setup (AI Studio)

To connect this codebase to your GitHub account:

1. In the **Google AI Studio** top right bar, click the **GitHub** or **Export** button.
2. Select **Connect GitHub Account** and authorize Google AI Studio with repository write permissions.
3. Choose either:
   - **Create a new repository** (e.g. `scholarspark-ai`), or
   - **Link to an existing repository**.
4. Push your commits directly. AI Studio will synchronize changes.

---

## 4. Google Cloud Run Deployment

### Option A: Automated via GitHub Actions (Recommended)

A production CI/CD workflow is provided in `.github/workflows/deploy.yml`.

#### 1. Setup Workload Identity Federation (WIF)
Workload Identity Federation enables GitHub Actions to authenticate to Google Cloud using short-lived tokens without storing long-lived service account keys.

Run in Google Cloud Shell or your local gcloud CLI:
```bash
# 1. Set environment variables
export PROJECT_ID="YOUR_GCP_PROJECT_ID"
export POOL_NAME="github-actions-pool"
export PROVIDER_NAME="github-provider"
export REPO="YOUR_GITHUB_USERNAME/scholarspark-ai"

# 2. Create Workload Identity Pool
gcloud iam workload-identity-pools create "$POOL_NAME" \
  --project="$PROJECT_ID" \
  --location="global" \
  --display-name="GitHub Actions Pool"

# 3. Create Workload Identity Provider
gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_NAME" \
  --project="$PROJECT_ID" \
  --location="global" \
  --workload-identity-pool="$POOL_NAME" \
  --display-name="GitHub Actions Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# 4. Create Service Account for Cloud Run deployment
gcloud iam service-accounts create cloud-run-deployer \
  --display-name="Cloud Run Deployer Service Account"

# 5. Bind GitHub Repository to the Service Account
gcloud iam service-accounts add-iam-policy-binding "cloud-run-deployer@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/YOUR_PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL_NAME/attribute.repository/$REPO"

# 6. Grant required Cloud Run & Artifact Registry permissions
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:cloud-run-deployer@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:cloud-run-deployer@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

#### 2. Configure GitHub Secrets
Navigate to **GitHub Repository > Settings > Secrets and variables > Actions**:
- `GCP_PROJECT_ID`: Your Google Cloud Project ID.
- `GCP_WORKLOAD_IDENTITY_PROVIDER`: `projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider`
- `GCP_SERVICE_ACCOUNT`: `cloud-run-deployer@PROJECT_ID.iam.gserviceaccount.com`
- `GCP_REGION`: `europe-west3` or `us-central1`.
- `CLOUD_RUN_SERVICE_NAME`: `scholarspark-ai`.

#### 3. Configure Gemini Secret in Google Secret Manager
Store your Gemini API Key securely in Secret Manager so Cloud Run mounts it at runtime:
```bash
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create GEMINI_API_KEY \
  --data-file=- \
  --replication-policy="automatic" \
  --project="$PROJECT_ID"

# Allow Cloud Run to access the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:cloud-run-deployer@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project="$PROJECT_ID"
```

---

### Option B: Direct CLI Deployment

You can build and deploy the application in one command:
```bash
# 1. Build and push container image using Cloud Build
gcloud builds submit --tag gcr.io/$PROJECT_ID/scholarspark-ai:v1

# 2. Deploy to Cloud Run
gcloud run deploy scholarspark-ai \
  --image gcr.io/$PROJECT_ID/scholarspark-ai:v1 \
  --platform managed \
  --region europe-west3 \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --port 3000
```

---

## 5. Health Monitoring & Rollbacks

### Health Check Endpoint
The server provides a status probe at `GET /api/health`:
```bash
curl https://your-cloud-run-url.run.app/api/health
```
Expected response:
```json
{
  "status": "ok",
  "service": "ScholarSpark AI Full-Stack Service",
  "time": "2026-10-28T07:19:00.000Z",
  "apiKeyConfigured": true,
  "curriculumsSupported": [
    "ECZ (Examinations Council of Zambia)",
    "Cambridge IGCSE"
  ]
}
```

### Rollback Procedure
If a bad release occurs, Google Cloud Run supports instant traffic shifting to a previous revision:
```bash
# 1. List past revisions
gcloud run revisions list --service=scholarspark-ai --region=europe-west3

# 2. Shift 100% traffic back to known healthy revision
gcloud run services update-traffic scholarspark-ai \
  --region=europe-west3 \
  --to-revisions=scholarspark-ai-00012-abc=100
```
