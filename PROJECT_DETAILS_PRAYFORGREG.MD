# Pray for Greg

Pray for Greg is a beautifully crafted direct prayer roster and support coordinator web application built for Greg's supportive community. This platform serves as a modern, reliable, and secure portal for coordinating prayer days, claiming roster spots, communicating date trades/swaps, and sending personal letters of encouragement and scriptures directly to Greg. 

The application is engineered to preserve a clean personal dashboard, offering interactive calendars for scheduling, high-performance media uploads, standard Web-Push notification infrastructure to immediately alert Greg, and direct WhatsApp integrations to simplify community sharing.

## Tech Stack and Requirements

- **Backend**: Node.js with Express, tsx type-stripping runtime, and `web-push` notifications protocol
- **Frontend**: React 19, Vite, Tailwind CSS v4, Motion (fluid animations), and `lucide-react` vector iconography
- **Database & Storage**: Google Cloud Firestore (persistent NoSQL document storage) and Firebase Cloud Storage (secure binary uploads with mime-type routing)
- **Push Notification Infrastructure**: Standard W3C Push API powered by custom VAPID public/private key coordinates
- **Security & Scope Security**: 
  - Express-based proxy routes (`/api/*`) keeping sensitive cloud credentials and VAPID secrets isolated from the client-side browser
  - Strict Firebase Security Rules (`firestore.rules`) enforcing identity integrity and access boundaries
  - Automatic base64 media conversion, optimizing image payloads prior to committing to regional Firebase storage targets

### Runtime and Setup Requirements

- **Node.js**: Version 18+ or 20+
- **Environment Configuration**: Supported via `.env` or container settings securing keys for:
  - `VAPID_PUBLIC_KEY` & `VAPID_PRIVATE_KEY` for instant web-push alerts
  - Firebase project coordinates (including custom database IDs) inside `firebase-applet-config.json`
- **Port Ingress**: Configured statically to listen exclusively on host `0.0.0.0` and port `3000`

---

## Core Features & Workflows

1. **Roster Scheduler**: Fully interactive direct date claims, swaps, and trade requests. Helps Greg's visual organizers visualize dates covered vs. gaps needing coverage.
2. **Clickable Support Wall**: Converts plain comments and media uploads into beautiful cards. Standard URL regex automatically parses user-posted hyperlinks—including YouTube links—into styling-safe, high-contrast clickable anchors.
3. **Optimized Media Hosting**: Integrates drag-and-drop / selector uploads. Image payloads are automatically resized, converted from local Base64 buffers on the backing server, and hosted permanently on Firebase Cloud Storage to generate resilient public CDN download links.
4. **Instant Push Alerting**: Dispatches standard native browser alert payloads directly to Greg's subscribed devices the second a member posts a new card.
5. **WhatsApp Integration**: Onboarding links, access credentials, and calendar synchronization triggers custom pre-filled WhatsApp templates to streamline direct contact.

---

## Deployment

The application is deployed on fully managed cloud infrastructure structured to serve real-time experiences:

- **Source Control**: Integrated on top of versioned Git tracking.
- **Preview & Dev Environment**: Hosted as a fully isolated, containerized application run on Google Cloud Run. This live sandbox dynamically builds, mounts, and listens on port `3000` behind an Nginx reverse-proxy router.
- **Production Flow**: Codebases can be deployed to standalone production instances on Google Cloud Run via the platform deployment engine, or cleanly exported directly to a GitHub repository or ZIP archive.
- **Database Layer**: Deployed onto high-durability regional Firestore instances, backed by rules deploying directly from `firestore.rules`.

This setup guarantees zero-maintenance scaling, cold-start efficiency, and rigorous security boundaries for all personal user profiles and communication records.
