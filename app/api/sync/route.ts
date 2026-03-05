import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export const runtime = 'edge';

// Initialize Redis from environment variables
// Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Cloudflare Pages > Settings > Variables
function getRedis(): Redis | null {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        return null;
    }

    return new Redis({ url, token });
}

export async function GET(request: NextRequest) {
    const profileId = request.headers.get('x-profile-id');

    if (!profileId) {
        return NextResponse.json({ error: 'Missing x-profile-id header' }, { status: 400 });
    }

    const redis = getRedis();

    if (!redis) {
        return NextResponse.json({
            warning: 'Upstash Redis not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.',
            data: null
        }, { status: 200 });
    }

    try {
        const key = `KVIDEO_USER_DATA:${profileId}`;
        const data = await redis.get(key);

        return NextResponse.json({ data: data ?? null });
    } catch (error) {
        console.error('Redis Read Error:', error);
        return NextResponse.json({ error: 'Failed to read from Redis' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const profileId = request.headers.get('x-profile-id');

    if (!profileId) {
        return NextResponse.json({ error: 'Missing x-profile-id header' }, { status: 400 });
    }

    const redis = getRedis();

    if (!redis) {
        return NextResponse.json({
            warning: 'Upstash Redis not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.',
            success: true
        }, { status: 200 });
    }

    try {
        const body = await request.json();
        const key = `KVIDEO_USER_DATA:${profileId}`;

        // Store with no expiry (persistent storage)
        await redis.set(key, JSON.stringify(body));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Redis Write Error:', error);
        return NextResponse.json({ error: 'Failed to write to Redis' }, { status: 500 });
    }
}
