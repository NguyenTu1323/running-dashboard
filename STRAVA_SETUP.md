# Strava Auto-Sync Setup Guide

This guide walks you through connecting your Strava account so that new runs are automatically added to your running dashboard.

**Cost: Free.** Strava API is free for personal use.
**How it works:** Your Google Apps Script checks Strava every 10 minutes for new runs and adds them to your sheet automatically.

---

## Step 1: Create a Strava API Application

1. Go to [https://www.strava.com/settings/api](https://www.strava.com/settings/api)
2. Fill in the form:
   - **Application Name**: `Running Dashboard`
   - **Category**: `Personal`
   - **Club**: (leave blank)
   - **Website**: `https://github.com` (any URL is fine)
   - **Authorization Callback Domain**: `developers.strava.com`
3. Click **Create**
4. Note down your **Client ID** and **Client Secret** — you'll need these in Step 3

---

## Step 2: Authorize the App (Get Refresh Token)

This one-time step grants your app permission to read your Strava activities.

### 2a. Open this URL in your browser

Replace `YOUR_CLIENT_ID` with the Client ID from Step 1:

```
https://www.strava.com/oauth/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=https://developers.strava.com&approval_prompt=force&scope=read,activity:read
```

### 2b. Click "Authorize"

You'll be redirected to a URL that looks like:

```
https://developers.strava.com/?state=&code=XXXXXXXXXXXXXX&scope=read,activity:read
```

Copy the `code` value from the URL (the part after `code=` and before `&scope`).

### 2c. Exchange the code for a refresh token

Run this command in your terminal. Replace the 3 placeholders:

```bash
curl -X POST https://www.strava.com/oauth/token \
  -d client_id=YOUR_CLIENT_ID \
  -d client_secret=YOUR_CLIENT_SECRET \
  -d code=THE_CODE_FROM_STEP_2B \
  -d grant_type=authorization_code
```

The response will look like:

```json
{
  "token_type": "Bearer",
  "access_token": "abc123...",
  "refresh_token": "def456...",
  "expires_at": 1234567890,
  "athlete": { "id": 12345, ... }
}
```

Save the **`refresh_token`** value — you'll need it in Step 3.

---

## Step 3: Update Google Apps Script

### 3a. Replace Code.gs

1. Open your Google Sheet
2. Go to **Extensions > Apps Script**
3. Delete all existing code in `Code.gs`
4. Copy and paste the entire contents of `google-apps-script/Code.gs` from this repo
5. Click **Save** (Ctrl+S)

### 3b. Store your Strava credentials

1. In the Apps Script editor, find the `setupStravaCredentials()` function
2. Replace the placeholder values with your actual credentials:
   - `YOUR_CLIENT_ID` → Client ID from Step 1
   - `YOUR_CLIENT_SECRET` → Client Secret from Step 1
   - `YOUR_REFRESH_TOKEN` → Refresh token from Step 2c
3. Click **Save**
4. Select `setupStravaCredentials` in the function dropdown, then click **Run**
5. Grant permissions if prompted
6. Check the **Execution log** — it should complete without errors

**Important:** After running, you can revert the placeholder values. The credentials are now stored securely in Script Properties.

### 3c. Install the automatic polling trigger

1. Select `installStravaTrigger` in the function dropdown
2. Click **Run**
3. Grant permissions if prompted
4. Check the **Execution log** — it should say "Strava polling trigger installed"

That's it! Your Apps Script will now check Strava every 10 minutes for new runs.

---

## How It Works

```
Every 10 minutes, Google Apps Script automatically:
  → Fetches your recent activities from Strava API
  → Filters: only "Run" type (skips rides, swims, etc.)
  → Checks: skip if date + km already exists in the sheet
  → Adds new runs to your Google Sheet: id | date | minutes | km
  → Your dashboard shows the new run next time you open it
```

No webhook, no proxy, no external services — just a simple timer inside Google Apps Script.

---

## Troubleshooting

### Check if the trigger is installed

In the Apps Script editor, click **Triggers** (clock icon) in the left sidebar. You should see a trigger for `pollStravaActivities` running every 10 minutes.

### Manually test the sync

Select `pollStravaActivities` in the function dropdown and click **Run**. Check the Execution log for results.

### Activities not syncing?

1. Open your Google Sheet > **Extensions > Apps Script**
2. Click **Executions** in the left sidebar
3. Look for recent `pollStravaActivities` executions and check for errors
4. Common issues:
   - **"Strava credentials not configured"** → Run `setupStravaCredentials()` again
   - **Duplicate skipped** → The activity already exists (same date + km)
   - **No new runs** → Only runs from the last 24 hours are checked

### Stop auto-sync

Select `removeStravaTrigger` in the function dropdown and click **Run**.

### Verify Strava credentials are stored

Run this in the Apps Script editor:

```javascript
function checkStravaCredentials() {
  const props = PropertiesService.getScriptProperties();
  Logger.log('Client ID: ' + (props.getProperty('STRAVA_CLIENT_ID') ? 'SET' : 'MISSING'));
  Logger.log('Client Secret: ' + (props.getProperty('STRAVA_CLIENT_SECRET') ? 'SET' : 'MISSING'));
  Logger.log('Refresh Token: ' + (props.getProperty('STRAVA_REFRESH_TOKEN') ? 'SET' : 'MISSING'));
}
```
