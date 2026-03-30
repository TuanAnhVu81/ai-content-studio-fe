# AI Content Studio

<p align="left">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</p>

AI Content Studio is a solo fullstack web application for planning campaigns, generating AI-assisted marketing content, refining copy in a rich text editor, analyzing content quality by platform, previewing banner mockups, and moderating the system through an admin panel.

This project is built with a product mindset rather than as a collection of isolated CRUD screens. The workflow is designed around how marketers and content teams actually work: campaign setup, content generation, editing, quality review, visual preview, and operational oversight.

## Live Demo

- Frontend: `https://avt-aicontentstudio.vercel.app/`

## Demo Accounts

Use these accounts to review the product from both user and admin perspectives.

### User account

- Email: `anhvt@gmail.com`
- Password: `12345678`

### Admin account

- Email: `admin@gmail.com`
- Password: `12345678`

Recommended review flow:

1. Login with the user account to explore campaign creation, AI content generation, the editor workflow, content analysis, and banner preview/export.
2. Login with the admin account to review user management, campaign monitoring, content moderation, and AI usage reporting.

## Screenshots

### Landing Page
The public landing page introduces the product clearly, highlights the core workflow, and gives recruiters a quick view of the UI direction before login.

<img width="100%" alt="Landing Page" src="https://github.com/user-attachments/assets/cb365a5f-f162-45e4-a410-44b6b0e2d430" />

### Content Editor
The rich text editor allows users to refine AI-generated copy, manage meta titles and descriptions, and maintain full control over the final content output.

<img width="100%" alt="Content Editor" src="https://github.com/user-attachments/assets/97662395-af00-4beb-a062-f6e282685437" />

### Content Quality Analysis
The real-time SEO analyzer provides platform-specific scoring and actionable suggestions (Keyword density, H1/H2 checks, Word count) to ensure professional quality.

<img width="100%" alt="Content Quality" src="https://github.com/user-attachments/assets/bc90ed7c-8408-4028-a1c7-13d75922d90a" />

### Banner Mockup Preview
Banner mockup preview lets users turn refined content into ready-to-share Feed or Story creatives with editable banner-specific copy and preset template styles.

<img width="100%" alt="Banner Mockup Preview" src="https://github.com/user-attachments/assets/2b4cbec6-d208-4a9c-a44b-ca21c2835fc6" />

### Admin Dashboard
The admin workspace provides visibility into users, campaigns, content moderation, and AI usage so the system feels complete beyond the end-user flow.

<img width="100%" alt="Admin Dashboard" src="https://github.com/user-attachments/assets/22672960-2d74-4447-881a-2f878a9f9df3" />

## Why This Project

Many content workflows are fragmented across multiple tools:

- campaign briefs in one place
- AI prompting in another
- editing in docs
- SEO checks in separate tools
- visual mockups in Canva or Photoshop

AI Content Studio brings those steps into one workspace:

1. Create and organize campaigns
2. Generate AI-assisted content from structured inputs
3. Refine copy in a rich text editor
4. Review platform-aware content quality rules
5. Preview banner mockups instantly
6. Save outputs and manage them through an admin workspace

## Core Features

### 1. Product-Oriented Content Workflow

- Campaign management with status tracking and metadata
- Content generation based on campaign context instead of raw free-form prompting
- End-to-end flow from draft generation to saved content record

### 2. Rich Editor With Platform-Aware Content Analysis

- Quill-based editor for refining generated copy
- Separate `meta title` and `meta description` fields
- Real-time scoring tailored by platform:
  - Website Blog
  - Email Marketing
  - Facebook Page
  - Instagram Post
  - TikTok Script
  - Google Ads
- Dynamic checklist and actionable suggestions instead of a one-size-fits-all SEO score

### 3. Banner Mockup Preview

- Feed and Story banner formats
- Multiple preset visual styles
- Editable banner-specific headline, supporting copy, and CTA
- Banner export to PNG
- Upload to Cloudinary and persist both:
  - `banner_url`
  - `banner_config`

### 4. Admin Panel

- Admin dashboard overview
- User management with status changes and required audit reasons
- Campaign monitoring
- Content moderation
- AI usage reporting

### 5. Authentication & Session Handling

- Register / login / logout
- Protected routes
- Admin-only routes
- Session refresh flow
- Query cache reset between accounts to avoid data leakage across sessions

## What This Project Demonstrates

This project is intentionally structured to reflect the kind of work expected from a fullstack product engineer:

- Analyzing requirements and turning them into a coherent web app structure
- Designing and implementing a UI that is both functional and presentation-ready
- Building both frontend and backend features around a real workflow
- Applying AI in practical product features, not only as a novelty
- Handling auth, caching, async state, and deployment constraints
- Thinking in terms of user experience, product flows, and maintainability

## My Role

This is a **solo fullstack project**.

I was responsible for:

- product planning and feature scoping
- frontend architecture and UI implementation
- backend API design and integration
- AI content generation workflow
- platform-aware content analysis logic
- banner mockup/export workflow
- admin management features
- deployment strategy for demo-ready hosting

## Tech Stack

### Frontend

- React 18
- Vite
- Tailwind CSS
- TanStack Query
- Zustand
- React Hook Form + Zod
- Axios
- React Quill
- Recharts
- html-to-image

### Backend

- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- Spring Data Redis
- Flyway
- MapStruct
- Hypersistence Utils (JSONB mapping)
- JUnit 5 + Mockito + AssertJ

### Infra / Services

- Frontend hosting: Vercel
- Backend hosting: Render
- PostgreSQL: Supabase
- Redis: Redis Cloud
- Image hosting: Cloudinary

## Architecture Notes

### Frontend

Feature-driven structure:

```text
src/
  components/
  features/
    auth/
    landing/
    dashboard/
    campaign/
    content/
    admin/
  hooks/
  services/
  store/
  routes/
  utils/
```

Key decisions:

- TanStack Query for server state and cache invalidation
- Zustand for auth/UI state
- service layer to normalize backend envelopes and snake_case/camelCase gaps
- editor-side content analysis kept client-side for responsive feedback
- banner mockup state persisted separately from article body

### Backend

The backend exposes APIs for:

- authentication
- campaign CRUD
- AI content generation
- content saving and retrieval
- banner persistence
- admin management
- AI usage reporting

## Key Workflows

### Content Creation Flow

1. User selects campaign, platform, tone, language, keyword
2. Backend generates a content draft
3. Frontend navigates to `/editor/:id`
4. User refines body copy and meta fields
5. Content analysis updates live based on the selected platform
6. User saves the content record

### Banner Workflow

1. Banner mockup derives initial copy from saved content
2. User edits banner-specific headline, supporting copy, and CTA
3. User chooses format and style
4. Frontend exports the mockup to PNG
5. Image is uploaded to Cloudinary
6. Backend persists `banner_url` and `banner_config`

### Admin Workflow

1. Admin reviews users, campaigns, contents, and AI usage
2. Sensitive actions require explicit reason input
3. Backend stores audit-related context for moderation actions

## AI Usage In This Project

AI is used as a practical product capability, not just as a coding assistant:

- AI-assisted content generation from structured marketing inputs
- generation prompts tuned for readability and platform fit
- content quality analysis integrated into the editor workflow
- banner mockup generation from refined content

AI was also used during development for:

- workflow ideation
- prompt iteration
- implementation support
- refinement of UX and copy rules

## SEO / Content Quality Perspective

This project includes foundational SEO and content-quality thinking:

- meta title and meta description handling
- heading structure analysis
- keyword placement logic
- word count thresholds
- platform-specific scoring rules

Instead of forcing every content type into blog-style SEO rules, the editor adapts its checklist based on the platform. This keeps the analysis more realistic for formats like email, social posts, short-form scripts, and ads.

## Local Development

### Frontend

```bash
npm install
npm run dev
```

### Frontend Environment Variables

Create `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
```

### Backend

The frontend expects a backend running with:

- Spring Boot API
- PostgreSQL
- Redis
- Cloudinary-compatible banner upload workflow

Add your backend repository/setup guide here if you want this README to be fully self-contained:

- Backend repository: `https://github.com/TuanAnhVu81/ai-content-studio-be`

## Deployment

### Frontend

- Deploy to Vercel
- Set SPA rewrite with `vercel.json`
- Configure:

```env
VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
```

### Backend / Data Stack

- Backend: Render Free Web Service
- PostgreSQL: Supabase
- Redis: Redis Cloud

This stack is intentionally chosen to stay free and practical for a portfolio demo while still reflecting a realistic deployment topology.

## Production-Minded Decisions

- protected and admin-only routing
- session recovery and logout handling
- cache clearing when switching accounts
- platform-aware scoring instead of one rigid rule set
- persisted banner mockup configuration
- explicit save flow for content changes
- required reasons for sensitive admin actions
- API normalization layer on the frontend

## Known Constraints

- Render free tier can cold start after inactivity
- Banner mockup uses preset templates rather than user-uploaded templates
- Rich text editor translation via browser extensions is intentionally limited to avoid DOM mutation issues in `react-quill`

## Future Enhancements

- user-uploaded banner templates
- richer analytics and historical charts
- collaborative commenting / review flow
- scheduled publishing integrations
- AI-assisted banner copy suggestions
- stronger role granularity beyond user/admin

## Project Structure Reference

```text
src/
  components/
    common/
    layout/
    ui/
  features/
    admin/
    auth/
    campaign/
    content/
    dashboard/
    landing/
  hooks/
  routes/
  services/
  store/
  utils/
```

## Contact

- Name: `Vu Tuan Anh`
- Email: `tuananhvu1123@gmail.com`  