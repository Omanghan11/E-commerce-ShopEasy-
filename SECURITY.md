# 🔒 Security Guide

This document outlines security best practices and measures implemented in this e-commerce platform.

## 🛡️ Security Features Implemented

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Protected admin routes with role-based access
- ✅ Token expiration (configurable)
- ✅ Secure cookie handling

### Data Protection
- ✅ MongoDB injection prevention
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Environment variable protection

### API Security
- ✅ Rate limiting (recommended to add)
- ✅ HTTPS enforcement (automatic with Vercel)
- ✅ Secure headers
- ✅ Error message sanitization

## 🔐 Environment Variables

### Critical Variables (Never Commit!)
```env
# Backend
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_super_long_random_secret
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com

# Frontend
VITE_API_URL=https://your-domain.com
```

### Generating Secure Secrets

**JWT Secret (Node.js):**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**JWT Secret (OpenSSL):**
```bash
openssl rand -hex 32
```

## 🚨 Security Checklist

### Before Deployment
- [ ] All `.env` files are in `.gitignore`
- [ ] No hardcoded credentials in code
- [ ] JWT secret is strong (32+ characters)
- [ ] MongoDB connection string is secure
- [ ] CORS is properly configured
- [ ] Admin routes require authentication
- [ ] Passwords are hashed, never stored plain text

### MongoDB Security
- [ ] Strong database password
- [ ] Network access restricted (or 0.0.0.0/0 for Vercel)
- [ ] Database user has minimal required permissions
- [ ] Connection string uses SSL/TLS
- [ ] Regular backups configured

### API Security
- [ ] All sensitive endpoints require authentication
- [ ] Admin endpoints check for admin role
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive info
- [ ] File uploads are validated and sanitized

### Frontend Security
- [ ] No sensitive data in localStorage
- [ ] API keys not exposed in client code
- [ ] XSS protection implemented
- [ ] CSRF protection for state-changing operations
- [ ] Secure cookie settings

## 🔍 Security Best Practices

### Password Requirements
Implement strong password requirements:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Session Management
- Use secure, httpOnly cookies for tokens
- Implement token refresh mechanism
- Clear tokens on logout
- Set appropriate token expiration

### File Uploads
- Validate file types
- Limit file sizes
- Sanitize file names
- Store files outside web root
- Use CDN for production

### Database Queries
- Use parameterized queries (Mongoose does this)
- Validate and sanitize all inputs
- Implement query result limits
- Use indexes for performance

## 🚫 Common Vulnerabilities to Avoid

### SQL/NoSQL Injection
**Bad:**
```javascript
User.find({ email: req.body.email })
```

**Good:**
```javascript
const email = validator.escape(req.body.email);
User.find({ email: email })
```

### XSS (Cross-Site Scripting)
**Bad:**
```javascript
element.innerHTML = userInput;
```

**Good:**
```javascript
element.textContent = userInput;
// Or use a sanitization library
```

### Exposed Secrets
**Bad:**
```javascript
const API_KEY = "sk_live_abc123";
```

**Good:**
```javascript
const API_KEY = process.env.API_KEY;
```

### Weak Authentication
**Bad:**
```javascript
if (user.password === inputPassword) // Plain text comparison
```

**Good:**
```javascript
const isValid = await bcrypt.compare(inputPassword, user.passwordHash);
```

## 🔄 Regular Security Maintenance

### Weekly
- [ ] Review error logs for suspicious activity
- [ ] Check for failed login attempts
- [ ] Monitor API usage patterns

### Monthly
- [ ] Update dependencies (`npm audit fix`)
- [ ] Review and rotate secrets if needed
- [ ] Check for security advisories
- [ ] Review user permissions

### Quarterly
- [ ] Security audit of codebase
- [ ] Penetration testing (if applicable)
- [ ] Review and update security policies
- [ ] Backup and disaster recovery testing

## 🆘 Security Incident Response

### If You Suspect a Breach:

1. **Immediate Actions:**
   - Rotate all secrets (JWT, database passwords)
   - Review recent access logs
   - Disable compromised accounts
   - Document the incident

2. **Investigation:**
   - Check MongoDB Atlas logs
   - Review Vercel deployment logs
   - Analyze API access patterns
   - Identify affected users

3. **Recovery:**
   - Patch vulnerabilities
   - Reset affected user passwords
   - Notify affected users (if required)
   - Update security measures

4. **Prevention:**
   - Document lessons learned
   - Update security procedures
   - Implement additional monitoring
   - Train team on new procedures

## 📚 Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

## 🔔 Reporting Security Issues

If you discover a security vulnerability, please email:
**security@yourdomain.com**

Please do NOT create a public GitHub issue for security vulnerabilities.

---

**Remember: Security is an ongoing process, not a one-time task!**
