import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// @ts-expect-error - getRequestContext is provided by the Cloudflare build plugin
import { getRequestContext } from '@cloudflare/next-on-pages';

// We want to safely get the KV namespace.
// In development, `getRequestContext` might not be available or setup, so we gracefully degrade.
async function getKV() {
    try {
        const ctx = getRequestContext();
        if (ctx?.env?.KVIDEO_KV) {
            return ctx.env.KVIDEO_KV;
        }
    } catch (e) {
        // Fallback below
    }
    
    // Fallback to process.env (e.g. Next.js standalone dev or alternative edge adapters)
    if (typeof process !== 'undefined' && process.env && (process.env as any).KVIDEO_KV) {
        return (process.env as any).KVIDEO_KV;
    }
    
    return null;
}

export async function GET(request: NextRequest) {
    const profileId = request.headers.get('x-profile-id');

    if (!profileId) {
        return NextResponse.json({ error: 'Missing x-profile-id header' }, { status: 400 });
    }

    const kv = await getKV();

    if (!kv) {
        // Fallback or dev mode handling
        return NextResponse.json({
            warning: 'KV namespace not found. This is normal in local dev without Wrangler.',
            data: null
        }, { status: 200 });
    }

    try {
        const key = `KVIDEO_USER_DATA:${profileId}`;
        const data = await kv.get(key, 'json');

        return NextResponse.json({ data });
    } catch (error) {
        console.error('KV Read Error:', error);
        return NextResponse.json({ error: 'Failed to read from KV' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const profileId = request.headers.get('x-profile-id');

    if (!profileId) {
        return NextResponse.json({ error: 'Missing x-profile-id header' }, { status: 400 });
    }

    const kv = await getKV();

    if (!kv) {
        return NextResponse.json({
            warning: 'KV namespace not found. Skipping backup.',
            success: true
        }, { status: 200 });
    }

    try {
        const body = await request.json();
        const key = `KVIDEO_USER_DATA:${profileId}`;

        // Store as JSON string.
        await kv.put(key, JSON.stringify(body));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('KV Write Error:', error);
        return NextResponse.json({ error: 'Failed to write to KV' }, { status: 500 });
    }
}
