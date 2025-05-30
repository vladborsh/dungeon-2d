# Netlify Deployment Guide for Dungeon 2D

This guide covers deploying your Dungeon 2D game to Netlify, both manually and through automated CI/CD.

## Quick Start

### Option 1: Netlify CLI (Recommended)

1. **Install Netlify CLI globally:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Build and deploy:**
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

### Option 2: Git-based Deployment

1. **Push your code to a Git repository** (GitHub, GitLab, or Bitbucket)

2. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git provider and select your repository

3. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18` (set in netlify.toml)

4. **Deploy:** Netlify will automatically build and deploy on every push to your main branch

### Option 3: Manual Upload

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Drag and drop the `dist` folder** to netlify.com

## Configuration Files

### netlify.toml
The `netlify.toml` file in your project root contains:
- Build configuration
- Security headers
- Caching rules
- Redirect rules
- Environment-specific settings

### Key Settings Explained

```toml
[build]
  publish = "dist"        # Output directory
  command = "npm run build"  # Build command

[build.environment]
  NODE_VERSION = "18"     # Node.js version
```

## Build Process

The deployment process follows these steps:

1. **Install dependencies** (`npm ci`)
2. **Run linting** (`npm run lint`)
3. **Build for production** (`npm run build`)
4. **Deploy to CDN**

## Performance Optimizations

### Caching Strategy
- **Static assets**: 1 year cache
- **Images**: 1 month cache
- **Audio files**: 1 week cache
- **HTML**: No cache (for updates)

### Security Headers
- Content Security Policy
- XSS Protection
- Frame Options
- Content Type Options

### Build Optimizations
- Code splitting
- Asset minification
- Gzip compression
- Image compression

## Custom Domain (Optional)

1. **Add custom domain in Netlify dashboard:**
   - Site settings → Domain management
   - Add custom domain

2. **Configure DNS:**
   - Point your domain to Netlify's servers
   - Enable HTTPS (automatic with Let's Encrypt)

## Environment Variables

If you need environment variables:

1. **In Netlify Dashboard:**
   - Site settings → Environment variables
   - Add key-value pairs

2. **In Code:**
   ```typescript
   const apiUrl = process.env.REACT_APP_API_URL || 'fallback-url';
   ```

## Monitoring and Analytics

### Build Logs
- View build logs in Netlify dashboard
- Check for errors or warnings

### Performance
- Use Netlify Analytics (paid feature)
- Or integrate Google Analytics

### Error Tracking
- Check browser console for client-side errors
- Use error tracking services like Sentry

## Troubleshooting

### Common Issues

1. **Build fails:**
   ```bash
   # Check Node.js version
   node --version
   
   # Clear npm cache
   npm cache clean --force
   
   # Delete node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Assets not loading:**
   - Check `publicPath` in webpack.config.js
   - Verify asset paths are relative

3. **404 errors:**
   - Check redirect rules in netlify.toml
   - Ensure SPA fallback is configured

### Debug Mode

Enable verbose logging:
```bash
npm run build -- --verbose
```

## Deployment Scripts

Use the provided deployment script:
```bash
./deploy.sh
```

Or create custom npm scripts:
```json
{
  "scripts": {
    "deploy": "npm run build && netlify deploy --prod --dir=dist",
    "deploy:preview": "npm run build && netlify deploy --dir=dist"
  }
}
```

## Security Considerations

1. **Never commit sensitive data**
2. **Use environment variables for API keys**
3. **Keep dependencies updated**
4. **Review security headers in netlify.toml**

## Performance Monitoring

Monitor your site performance:
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)
- [WebPageTest](https://www.webpagetest.org/)

## Next Steps

After successful deployment:

1. **Set up monitoring** for uptime and performance
2. **Configure analytics** to track user engagement
3. **Set up error tracking** for production issues
4. **Consider CDN optimization** for global distribution
5. **Implement progressive web app features** if needed

## Support

- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Community](https://community.netlify.com/)
- [GitHub Issues](https://github.com/netlify/netlify-cli/issues) for CLI issues
