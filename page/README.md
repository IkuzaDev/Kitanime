# KitaNime - Anime Streaming Platform

A modern anime streaming web application built with Node.js, Express, and Pug templates.

## Features

- 🎬 **Enhanced Video Player**: Modern video player with advanced seeking capabilities
- 📱 **Responsive Design**: Optimized for all devices with smooth animations
- 🎯 **Smart Seeking**: Jump to timestamps even before video fully loads
- 🔄 **Auto Next Episode**: Automatic episode progression
- 📥 **Download Links**: Multiple download options with organized providers
- 🎨 **Modern UI**: Beautiful gradient designs and smooth transitions
- ⚡ **Performance Optimized**: Built for fast loading and smooth playback

## Enhanced Player Features

### 🎮 Player Controls
- **Keyboard Shortcuts**: Space (play/pause), Arrow keys (seek/volume), F (fullscreen), M (mute)
- **Touch Gestures**: Swipe left/right to seek on mobile devices
- **Smart Loading**: Loading states with progress indicators
- **Error Recovery**: Automatic retry mechanism with user-friendly error messages

### 🎯 Advanced Seeking
- **Pre-load Seeking**: Jump to any timestamp even before video fully loads
- **Progress Memory**: Remembers playback position for up to 7 days
- **Smooth Transitions**: Animated seeking with visual feedback

### 📱 Mobile Optimized
- **Touch-friendly Controls**: Large touch targets and gesture support
- **Responsive Layout**: Adapts to all screen sizes
- **Performance Optimized**: Efficient loading and playback on mobile devices

## Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kitanime-page
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3001
   ```

### Production Deployment

#### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   vercel
   ```

3. **Set environment variables in Vercel dashboard**
   - `NODE_ENV=production`
   - `SESSION_SECRET=your-secret-key`

#### Manual Deployment

1. **Build for production**
   ```bash
   npm install --production
   ```

2. **Start the server**
   ```bash
   npm start
   ```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | No |
| `PORT` | Server port | `3001` | No |
| `SESSION_SECRET` | Session encryption key | `kitanime-secret-key-change-in-production` | Yes (Production) |

## Project Structure

```
├── app.js                 # Main application file
├── vercel.json           # Vercel deployment configuration
├── package.json          # Dependencies and scripts
├── views/                # Pug templates
│   ├── layout.pug       # Base layout
│   ├── episode-player.pug # Enhanced video player
│   └── ...              # Other views
├── routes/               # Express routes
├── public/               # Static assets
├── middleware/           # Custom middleware
└── models/               # Database models
```

## API Endpoints

- `GET /stream?url=<video_url>` - Video streaming proxy with CORS support
- `GET /proxy?url=<url>` - General proxy endpoint
- `GET /api/*` - API routes for data fetching

## Browser Compatibility

### Supported Browsers
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Player Features by Browser
| Feature | Chrome | Firefox | Safari | Edge | Mobile |
|---------|--------|---------|--------|------|--------|
| Video Playback | ✅ | ✅ | ✅ | ✅ | ✅ |
| Advanced Seeking | ✅ | ✅ | ✅ | ✅ | ✅ |
| Keyboard Shortcuts | ✅ | ✅ | ✅ | ✅ | ❌ |
| Touch Gestures | ✅ | ✅ | ✅ | ✅ | ✅ |
| Fullscreen API | ✅ | ✅ | ✅ | ✅ | ✅ |

## Performance Optimizations

### Vercel Optimizations
- **Serverless Functions**: Optimized for Vercel's serverless environment
- **Edge Caching**: Static assets cached at edge locations
- **Compression**: Gzip compression enabled
- **CORS Headers**: Properly configured for cross-origin requests

### Player Optimizations
- **Lazy Loading**: Videos load only when needed
- **Progressive Enhancement**: Works without JavaScript
- **Memory Management**: Automatic cleanup on navigation
- **Error Recovery**: Graceful handling of network issues

## Troubleshooting

### Common Issues

1. **Video won't play**
   - Check browser console for errors
   - Verify video source URL is accessible
   - Try refreshing the page

2. **Seeking not working**
   - Wait for video metadata to load
   - Check network connection
   - Try a different browser

3. **Mobile playback issues**
   - Ensure autoplay is enabled in browser settings
   - Check if device supports the video format
   - Try using headphones (some devices require user interaction)

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your environment variables.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly across different browsers
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Check the troubleshooting section above
- Open an issue on GitHub
- Contact the development team

---

**Built with ❤️ for anime lovers everywhere**