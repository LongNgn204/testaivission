import { IRequest } from 'itty-router'
import { DatabaseService } from '../services/database'

// Simple base64url helpers
function base64url(input: ArrayBuffer | string): string {
  const str = typeof input === 'string' ? input : String.fromCharCode(...new Uint8Array(input as ArrayBuffer))
  // atob/btoa are available; but we need from string -> base64
  const base64 = btoa(str)
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function utf8ToUint8(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

async function hmacSign(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    utf8ToUint8(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, utf8ToUint8(data))
  return base64url(sig)
}

function toBase64UrlJSON(obj: Record<string, any>): string {
  return base64url(JSON.stringify(obj))
}

async function signJWT(payload: Record<string, any>, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' }
  const encodedHeader = toBase64UrlJSON(header)
  const encodedPayload = toBase64UrlJSON(payload)
  const toSign = `${encodedHeader}.${encodedPayload}`
  const signature = await hmacSign(secret, toSign)
  return `${toSign}.${signature}`
}

export async function verifyJWT(token: string, secret: string): Promise<Record<string, any> | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [h, p, s] = parts
    const toSign = `${h}.${p}`
    const expected = await hmacSign(secret, toSign)
    if (s !== expected) return null
    const json = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(p.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))))
    if (json.exp && Date.now() >= json.exp) return null
    return json
  } catch (e) {
    return null
  }
}

function cleanPhone(p: string): string {
  return (p || '').replace(/\D/g, '')
}

function jsonResponse(obj: any, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } })
}

export async function login(request: IRequest, env: any): Promise<Response> {
  try {
    const body = await (request as unknown as Request).json() as any
    const { name, age, phone } = body

    if (!name || !age || !phone) {
      return jsonResponse({ success: false, message: 'Missing required fields: name, age, phone', error: 'MISSING_FIELDS' }, 400)
    }

    if (String(name).trim().length < 2) {
      return jsonResponse({ success: false, message: 'Name must be at least 2 characters', error: 'INVALID_NAME' }, 400)
    }

    const ageNum = parseInt(String(age))
    if (isNaN(ageNum) || ageNum < 5 || ageNum > 120) {
      return jsonResponse({ success: false, message: 'Age must be between 5 and 120', error: 'INVALID_AGE' }, 400)
    }

    const phoneClean = cleanPhone(String(phone))
    if (!/^0\d{9,10}$/.test(phoneClean)) {
      return jsonResponse({ success: false, message: 'Invalid phone number format (Vietnamese format required)', error: 'INVALID_PHONE' }, 400)
    }

    const now = Date.now()

    // Initialize database service
    const db = new DatabaseService(env.DB)

    // Check if user exists
    let user = await db.getUserByPhone(phoneClean)
    
    if (!user) {
      // Create new user
      user = await db.createUser({
        name: String(name).trim(),
        age: ageNum,
        phone: phoneClean,
      })
    } else {
      // Update last login
      await db.updateUserLastLogin(user.id)
    }

    // Sign JWT
    const exp = now + 7 * 24 * 60 * 60 * 1000 // 7 days ms
    const token = await signJWT({ 
      userId: user.id, 
      name: user.name, 
      phone: user.phone, 
      age: user.age, 
      exp 
    }, env.JWT_SECRET)

    // Save session in D1
    await db.createSession({
      user_id: user.id,
      token,
      expires_at: exp,
      device_info: JSON.stringify({
        userAgent: (request as any).headers?.get?.('user-agent') || 'unknown',
        timestamp: now,
      }),
    })

    // Track login event
    await db.trackEvent('login', user.id, { phone: phoneClean })

    return jsonResponse({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        age: user.age,
        phone: user.phone,
        loginTime: now,
        token,
      },
    })
  } catch (e: any) {
    return jsonResponse({ success: false, message: 'Login failed', error: e?.message || 'UNKNOWN' }, 500)
  }
}

export async function verifyToken(request: IRequest, env: any): Promise<Response> {
  try {
    const body = await (request as unknown as Request).json() as any
    const { token } = body
    if (!token) return jsonResponse({ success: false, message: 'Token is required' }, 400)

    const decoded = await verifyJWT(String(token), env.JWT_SECRET)
    if (!decoded) return jsonResponse({ success: false, message: 'Invalid or expired token' }, 403)

    // Check session in D1
    const db = new DatabaseService(env.DB)
    const session = await db.getSessionByToken(String(token))
    
    if (!session || session.expires_at < Date.now()) {
      if (session) {
        await db.deleteSession(session.id)
      }
      return jsonResponse({ success: false, message: 'Session expired' }, 403)
    }

    // Get user data
    const user = await db.getUserById(session.user_id)
    if (!user) {
      return jsonResponse({ success: false, message: 'User not found' }, 404)
    }

    return jsonResponse({ 
      success: true, 
      message: 'Token is valid', 
      user: { 
        userId: user.id, 
        phone: user.phone, 
        name: user.name, 
        age: user.age 
      } 
    })
  } catch (e: any) {
    return jsonResponse({ success: false, message: 'Token verification failed', error: e?.message || 'UNKNOWN' }, 500)
  }
}

export async function logout(request: IRequest, env: any): Promise<Response> {
  try {
    const auth = request.headers.get('authorization') || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    if (!token) return jsonResponse({ success: false, message: 'Token is required', error: 'MISSING_TOKEN' }, 400)

    const db = new DatabaseService(env.DB)
    const session = await db.getSessionByToken(token)
    
    if (!session) {
      return jsonResponse({ success: false, message: 'Session not found', error: 'SESSION_NOT_FOUND' }, 404)
    }

    await db.deleteSession(session.id)
    await db.trackEvent('logout', session.user_id)

    return jsonResponse({ success: true, message: 'Logout successful' })
  } catch (e: any) {
    return jsonResponse({ success: false, message: 'Logout failed', error: e?.message || 'UNKNOWN' }, 500)
  }
}
