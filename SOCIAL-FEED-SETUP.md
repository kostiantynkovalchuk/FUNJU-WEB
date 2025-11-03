# 📱 Social Media Feed Setup Guide

## Overview
The Fans section can display **real Instagram posts and TikTok videos** using official embed codes. Currently showing placeholders until you add actual post URLs.

---

## 🎯 How to Add Real Posts

### Option 1: Instagram Posts

1. **Go to Instagram post** on desktop (https://www.instagram.com/funju.soju)
2. Click the **"..."** menu on the post
3. Select **"Embed"**
4. Copy the **post URL** (looks like: `https://www.instagram.com/p/ABC123DEF/`)
5. Open `js/social-feed.js`
6. Replace `url: null` with your post URL:

```javascript
{
  type: "instagram",
  url: "https://www.instagram.com/p/YOUR_POST_ID/",
},
```

### Option 2: TikTok Videos

1. **Go to TikTok video** (https://www.tiktok.com/@funju.soju)
2. Click **"..."** menu
3. Select **"Embed"**
4. Copy the **video ID** (the long number in the URL)
5. Open `js/social-feed.js`
6. Replace `videoId: null` with your video ID:

```javascript
{
  type: "tiktok",
  videoId: "1234567890123456789",
},
```

---

## 📝 Example Configuration

Open [js/social-feed.js](js/social-feed.js:11-32) and update the `posts` array:

```javascript
this.posts = [
  {
    type: "instagram",
    url: "https://www.instagram.com/p/ABC123DEF/",
  },
  {
    type: "instagram",
    url: "https://www.instagram.com/p/XYZ789GHI/",
  },
  {
    type: "tiktok",
    videoId: "7123456789012345678",
  },
  {
    type: "instagram",
    url: "https://www.instagram.com/p/LMN456OPQ/",
  },
  {
    type: "tiktok",
    videoId: "7234567890123456789",
  },
  {
    type: "instagram",
    url: "https://www.instagram.com/p/RST012UVW/",
  },
];
```

---

## ✅ Features

- **Masonry Grid Layout** - Posts automatically arrange in columns with varied heights
- **Responsive Design** - Works on mobile, tablet, and desktop
- **Auto-loading** - Embed scripts load automatically
- **Fallback Placeholders** - Shows nice placeholders if no URL provided
- **Mix Content** - Combine Instagram and TikTok in any order

---

## 🚀 Quick Test

**To test with a sample post:**

1. Find any public Instagram post
2. Get the embed URL
3. Open browser console on your site
4. Run:
```javascript
window.socialFeed.addPost('instagram', 'https://www.instagram.com/p/SAMPLE_POST_ID/');
```

The post will appear immediately at the top of the feed!

---

## 🎨 Customization

### Change Number of Posts

In `js/social-feed.js`, add or remove items from the `posts` array.

### Change Grid Columns

In `css/style.css` (line 812):
```css
.fans-grid {
  column-count: 3; /* Change to 2 or 4 */
  column-gap: 20px;
}
```

### Adjust Card Heights

In `css/style.css` (lines 1100-1122), modify `min-height` values for different masonry effect.

---

## 📌 Important Notes

1. **Public Posts Only** - Only public Instagram/TikTok posts can be embedded
2. **No API Key Needed** - Uses official embed widgets (free)
3. **Auto-updates** - When you post new content, just add the URL to the config
4. **Privacy Compliant** - Uses official embed codes approved by Instagram/TikTok

---

## 🐛 Troubleshooting

**Posts not loading?**
- Check console for errors (F12)
- Verify URLs are correct
- Ensure posts are public
- Try refreshing the page

**Layout broken?**
- Clear browser cache
- Check CSS file loaded correctly
- Verify `social-feed.js` is included before `app.js`

**Mixed content warning?**
- Ensure your site is HTTPS
- Check embed script URLs are HTTPS

---

## 💡 Pro Tips

- **Mix content types** for variety (alternate Instagram/TikTok)
- **Update regularly** with fresh posts to keep feed dynamic
- **Feature best content** - put your most engaging posts first
- **Monitor performance** - too many embeds may slow page load

---

## 🆘 Need Help?

The code is fully commented and ready to use. Just add your post URLs and you're done! 🎉