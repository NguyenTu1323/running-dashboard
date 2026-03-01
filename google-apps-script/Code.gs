/**
 * Running Dashboard — Google Apps Script Backend
 *
 * Setup:
 * 1. Create a Google Sheet with columns in row 1: id | date | minutes | km
 * 2. Go to Extensions → Apps Script
 * 3. Paste this entire file
 * 4. Replace API_KEY below with your chosen secret key
 * 5. Deploy → New Deployment → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy the deployment URL into src/config.js
 *
 * Strava Auto-Sync Setup (see STRAVA_SETUP.md for full guide):
 * 1. Create a Strava API app at https://developers.strava.com
 * 2. Run setupStravaCredentials() with your client_id, client_secret, refresh_token
 * 3. Run installStravaTrigger() to start automatic polling every 10 minutes
 */

var API_KEY = 'my-running-key-2026';

function doGet(e) {
  try {
    if (!validateApiKey(e)) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }
    var year = e.parameter.year;
    var activities = getActivities(year);
    return jsonResponse({ success: true, data: activities });
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);

    if (body.apiKey !== API_KEY) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    var action = body.action;
    var result;

    if (action === 'create') {
      result = createActivity(body.data);
      return jsonResponse({ success: true, data: result });
    }

    if (action === 'update') {
      result = updateActivity(body.id, body.data);
      return jsonResponse({ success: true, data: result });
    }

    if (action === 'delete') {
      deleteActivity(body.id);
      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: 'Invalid action' }, 400);
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

function validateApiKey(e) {
  return e.parameter.apiKey === API_KEY;
}

function getSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
}

function getActivities(year) {
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var activities = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var activity = {};
    for (var j = 0; j < headers.length; j++) {
      activity[headers[j]] = row[j];
    }
    if (activity.date instanceof Date) {
      activity.date = Utilities.formatDate(activity.date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    }
    if (year) {
      var activityYear = String(activity.date).substring(0, 4);
      if (activityYear === String(year)) {
        activities.push(activity);
      }
    } else {
      activities.push(activity);
    }
  }
  return activities;
}

function createActivity(data) {
  var sheet = getSheet();
  var id = Utilities.getUuid();
  sheet.appendRow([id, data.date, Number(data.minutes), Number(data.km)]);
  return { id: id, date: data.date, minutes: Number(data.minutes), km: Number(data.km) };
}

function updateActivity(id, data) {
  var sheet = getSheet();
  var rows = sheet.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) {
      if (data.date !== undefined) sheet.getRange(i + 1, 2).setValue(data.date);
      if (data.minutes !== undefined) sheet.getRange(i + 1, 3).setValue(Number(data.minutes));
      if (data.km !== undefined) sheet.getRange(i + 1, 4).setValue(Number(data.km));
      return { id: id, date: data.date, minutes: Number(data.minutes), km: Number(data.km) };
    }
  }
  throw new Error('Activity not found');
}

function deleteActivity(id) {
  var sheet = getSheet();
  var rows = sheet.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
  throw new Error('Activity not found');
}

function jsonResponse(data, status) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── Strava Integration (Polling) ───────────────────────────────────────────

/**
 * One-time setup: Run this function manually from the Apps Script editor
 * to store your Strava credentials securely.
 *
 * Replace the placeholder values with your actual Strava API credentials.
 */
function setupStravaCredentials() {
  var props = PropertiesService.getScriptProperties();
  props.setProperties({
    STRAVA_CLIENT_ID: 'YOUR_CLIENT_ID',
    STRAVA_CLIENT_SECRET: 'YOUR_CLIENT_SECRET',
    STRAVA_REFRESH_TOKEN: 'YOUR_REFRESH_TOKEN'
  });
  console.log('Strava credentials saved successfully.');
}

/**
 * One-time setup: Run this function manually to install the automatic trigger.
 * It will poll Strava for new runs every 10 minutes.
 */
function installStravaTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'pollStravaActivities') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger('pollStravaActivities')
    .timeBased()
    .everyMinutes(10)
    .create();
  console.log('Strava polling trigger installed. Will check for new runs every 10 minutes.');
}

/**
 * Remove the Strava polling trigger (if you want to stop auto-sync).
 */
function removeStravaTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  var removed = 0;
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'pollStravaActivities') {
      ScriptApp.deleteTrigger(triggers[i]);
      removed++;
    }
  }
  console.log('Removed ' + removed + ' Strava trigger(s).');
}

/**
 * Poll Strava for recent activities and add new runs to the sheet.
 * Called automatically by the time-based trigger every 10 minutes.
 */
function pollStravaActivities() {
  try {
    var accessToken = getStravaAccessToken();
    var after = Math.floor(Date.now() / 1000) - 86400;
    var response = UrlFetchApp.fetch(
      'https://www.strava.com/api/v3/athlete/activities?after=' + after + '&per_page=30',
      { headers: { 'Authorization': 'Bearer ' + accessToken } }
    );

    var activities = JSON.parse(response.getContentText());
    var added = 0;

    for (var i = 0; i < activities.length; i++) {
      var activity = activities[i];

      if (activity.type !== 'Run' && activity.sport_type !== 'Run') {
        continue;
      }

      var date = activity.start_date_local.substring(0, 10);
      var minutes = Math.round(activity.moving_time / 60);
      var km = Math.round((activity.distance / 1000) * 100) / 100;

      if (isDuplicate(date, km)) {
        continue;
      }

      createActivity({ date: date, minutes: minutes, km: km });
      added++;
      console.log('Added Strava run: ' + date + ' | ' + minutes + 'min | ' + km + 'km');
    }

    if (added > 0) {
      console.log('Strava sync complete: added ' + added + ' new run(s).');
    }
  } catch (err) {
    console.log('Strava polling error: ' + err.message);
  }
}

/**
 * Get a fresh Strava access token using the stored refresh token.
 * Updates the stored refresh token if Strava issues a new one.
 */
function getStravaAccessToken() {
  var props = PropertiesService.getScriptProperties();
  var clientId = props.getProperty('STRAVA_CLIENT_ID');
  var clientSecret = props.getProperty('STRAVA_CLIENT_SECRET');
  var refreshToken = props.getProperty('STRAVA_REFRESH_TOKEN');

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Strava credentials not configured. Run setupStravaCredentials() first.');
  }

  var response = UrlFetchApp.fetch('https://www.strava.com/oauth/token', {
    method: 'post',
    payload: {
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    }
  });

  var data = JSON.parse(response.getContentText());

  if (data.refresh_token && data.refresh_token !== refreshToken) {
    props.setProperty('STRAVA_REFRESH_TOKEN', data.refresh_token);
  }

  return data.access_token;
}

/**
 * Check if an activity with the same date and km already exists.
 */
function isDuplicate(date, km) {
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    var rowDate = data[i][1];
    if (rowDate instanceof Date) {
      rowDate = Utilities.formatDate(rowDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    }
    var rowKm = Number(data[i][3]);

    if (String(rowDate) === String(date) && rowKm === km) {
      return true;
    }
  }
  return false;
}
