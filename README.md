# [vodsurf.org](https://vodsurf.org)

## `/random` api endpoint

The `/random` endpoint returns random videos from specified channels using various strategies.

### Parameters

- `streamer`: The name of the streamer. (Required)
- `channels`: A list of channel IDs separated by commas, defaults to all of the given streamer's channels. (Optional)
- `strategy`: Video selection strategy, default is `by_duration`. (Optional)
- `count`: Number of random videos to return, default is 1. (Optional)

### Example Requests

#### Curl

```bash
curl "https://vodsurf.org/random?streamer=vine&strategy=by_video&count=3"
```

#### JavaScript Fetch

```javascript
fetch("https://vodsurf.org/random?streamer=vine&strategy=by_video&count=3")
  .then((response) => response.json())
  .then((data) => console.log(data));
```

#### Python Requests

```python
import requests

response = requests.get("https://vodsurf.org/random", params={
  "streamer": "vine",
  "strategy": "by_video",
  "count": 3
})
print(response.json())
```

### Response

A JSON array of videos with the following fields:

- `channelId`
- `channelTitle`
- `duration`
- `publishedAt`
- `startSeconds`
- `videoId`
- `videoTitle`
- `viewCount`

#### Example

```bash
curl "https://vodsurf.org/random?streamer=vine" | jq
```

```json
[
  {
    "channelId": "UC2_IYqb1Tc_8Azh7rByedPA",
    "channelTitle": "Vinesauce: The Full Sauce",
    "duration": 18589,
    "publishedAt": "2022-02-25 06:15:08",
    "startSeconds": 1992,
    "videoId": "6UJfE9nDPFE",
    "videoTitle": "[Vinesauce] Vinny - Elden Ring (PART 1)",
    "viewCount": 211064
  }
]
```

### Errors

- `400 Bad Request` if the `streamer` parameter is missing or unsupported.

## Run locally

### Prerequisities

- [pnpm](https://pnpm.io/installation)

### Install

```bash
git clone https://github.com/jak3122/vodsurf.git
cd vodsurf
pnpm install
```

```bash
pnpm dev
```

### Build database

To build the sqlite database files from the configured streamers' channels:

```bash
pnpm sync-full
```

## Custom streamers

All configuration for the streamers and their channels, names, and theme are handled in `streamers/index.js`.

The `channelId` is required for each channel in the config. There's no official way of getting a channel's ID from the YouTube API, so the simplest way seems to be this:

1. Go to a channel's page, e.g. https://www.youtube.com/@vinesaucefullsauce
2. View the page source
3. ctrl+f for `rel="canonical"`
4. There should be only one result, where the `href` will contain the channel ID, e.g. `<link rel="canonical" href="https://www.youtube.com/channel/UC2_IYqb1Tc_8Azh7rByedPA">`
